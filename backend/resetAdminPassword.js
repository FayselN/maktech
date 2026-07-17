const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maktech';

const resetPassword = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    const adminEmail = 'admin@maktech.app';
    const newPassword = 'password123';

    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      console.log(`No admin found with email: ${adminEmail}`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    admin.passwordHash = passwordHash;
    await admin.save();

    console.log('Password reset successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`New Password: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
