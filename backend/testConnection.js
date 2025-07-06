require('dotenv').config();
const mongoose = require('mongoose');

const uri = "mongodb+srv://madhujyaphukan89:YOUR_PASSWORD_HERE@shopee-db.xmlhwlj.mongodb.net/shopee?retryWrites=true&w=majority&appName=shopee-db";

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection(); 