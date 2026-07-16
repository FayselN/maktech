const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maktech';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    const adminEmail = 'admin@maktech.com';
    const adminPassword = 'password123';

    const exists = await Admin.findOne({ email: adminEmail });
    if (exists) {
      console.log('Admin user already exists! You can log in with:');
      console.log(`Email: ${adminEmail}`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await Admin.create({
      name: 'Admin User',
      email: adminEmail,
      passwordHash,
      role: 'admin'
    });

    console.log(`Admin user seeded successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
