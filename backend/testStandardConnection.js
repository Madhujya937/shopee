const mongoose = require('mongoose');

async function testStandardConnection() {
  try {
    console.log('Testing standard MongoDB connection...');
    
    // Use the standard connection string (not SRV)
    const connectionString = 'mongodb://madhujyaphukan89:madhujya123@ac-dbqwabl-shard-00-00.xmlhwlj.mongodb.net:27017,ac-dbqwabl-shard-00-01.xmlhwlj.mongodb.net:27017,ac-dbqwabl-shard-00-02.xmlhwlj.mongodb.net:27017/shopee?ssl=true&replicaSet=atlas-ac-dbqwabl-shard-0&authSource=admin&retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB with standard connection string...');
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully with standard connection string!');
    
    // Test if we can query the database
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    console.log(`✅ Database has ${count} products`);
    
    await mongoose.disconnect();
    console.log('✅ Standard connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Standard MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testStandardConnection(); 