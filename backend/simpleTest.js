const mongoose = require('mongoose');

async function simpleTest() {
  try {
    console.log('Starting simple MongoDB test...');
    
    const uri = 'mongodb+srv://madhujyaphukan89:madhujya123@shopee-db.xmlhwlj.mongodb.net/shopee?retryWrites=true&w=majority&appName=shopee-db';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

simpleTest(); 