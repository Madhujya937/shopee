require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const products = await Product.find({});
      console.log(`Found ${products.length} products`);
      
      products.forEach(product => {
        console.log(`\nProduct: ${product.name}`);
        console.log(`Images: ${JSON.stringify(product.images)}`);
        
        if (product.images && product.images.length > 0) {
          product.images.forEach((imagePath, index) => {
            console.log(`  Image ${index + 1}: ${imagePath}`);
            
            // Test the URL construction
            const baseUrl = 'https://shopee-o2b3.onrender.com';
            let testUrl;
            
            if (imagePath.startsWith('uploads/')) {
              testUrl = `${baseUrl}/${imagePath}`;
            } else {
              testUrl = `${baseUrl}/uploads/${imagePath}`;
            }
            
            console.log(`  Test URL: ${testUrl}`);
          });
        } else {
          console.log('  No images');
        }
      });
      
    } catch (error) {
      console.error('Error checking products:', error);
    } finally {
      mongoose.connection.close();
      console.log('\nDatabase connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 