const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/shopee')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const products = await Product.find({});
    console.log('\nProducts in database:');
    console.log('=====================');
    
    if (products.length === 0) {
      console.log('No products found in database');
    } else {
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Stock: ${product.stock}`);
        console.log(`   - Price: $${product.price}`);
        console.log(`   - Category: ${product.category}`);
        console.log('');
      });
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
  }); 