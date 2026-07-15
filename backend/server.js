require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');
const { initializeFirebase } = require('./config/firebase');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  connectCloudinary();

  try {
    initializeFirebase();
  } catch (error) {
    console.warn('Firebase initialization skipped:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
