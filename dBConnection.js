require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected Successfully');
    console.log(`- Host: ${mongoose.connection.host}`);
    console.log(`- Database: ${mongoose.connection.name}`);

    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟠 Mongoose disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('⏹️ Mongoose connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check MONGO_URI in .env file');
    console.log('2. Verify IP whitelisting in MongoDB Atlas');
    console.log('3. Check internet connection');
    process.exit(1);
  }
};

module.exports = connectDB;