const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/shopee')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Update the stock of nfsnfj product
    const result = await Product.findOneAndUpdate(
      { name: 'nfsnfj' },
      { stock: 100 }, // Increase stock to 100
      { new: true }
    );
    
    if (result) {
      console.log(`Updated ${result.name} stock to ${result.stock}`);
    } else {
      console.log('Product nfsnfj not found');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
  }); 