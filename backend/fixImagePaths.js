require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      const products = await Product.find({});
      let updatedCount = 0;
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          const newImages = product.images.map(img => img.replace(/\\/g, '/'));
          if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
            product.images = newImages;
            await product.save();
            updatedCount++;
            console.log(`Updated product: ${product.name}`);
          }
        }
      }
      console.log(`\nUpdated ${updatedCount} products.`);
    } catch (err) {
      console.error('Error updating products:', err);
    } finally {
      mongoose.connection.close();
      console.log('Database connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 