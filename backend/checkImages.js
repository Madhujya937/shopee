require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

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
            const fullPath = path.join(__dirname, imagePath);
            const exists = fs.existsSync(fullPath);
            console.log(`  Image ${index + 1}: ${imagePath}`);
            console.log(`  Full path: ${fullPath}`);
            console.log(`  File exists: ${exists ? '✅' : '❌'}`);
            
            if (exists) {
              const stats = fs.statSync(fullPath);
              console.log(`  File size: ${stats.size} bytes`);
            }
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