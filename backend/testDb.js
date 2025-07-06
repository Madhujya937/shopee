require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Use the correct connection string for testing with URL encoded password
    const connectionString = 'mongodb+srv://madhujyaphukan89:madhujya123@shopee-db.xmlhwlj.mongodb.net/shopee?retryWrites=true&w=majority&appName=shopee-db';
    
    console.log('MONGODB_URI:', connectionString ? 'Set' : 'Not set');
    
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test if we can query the database
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    console.log(`✅ Database has ${count} products`);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection(); 