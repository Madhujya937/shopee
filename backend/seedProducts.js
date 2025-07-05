require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Sample products data
const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with advanced camera system and A17 Pro chip",
    price: 999.99,
    category: "Electronics",
    stock: 50,
    images: []
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone with AI features",
    price: 899.99,
    category: "Electronics",
    stock: 30,
    images: []
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with Air Max technology",
    price: 129.99,
    category: "Fashion",
    stock: 100,
    images: []
  },
  {
    name: "Adidas Ultraboost 22",
    description: "High-performance running shoes with Boost technology",
    price: 179.99,
    category: "Fashion",
    stock: 75,
    images: []
  },
  {
    name: "MacBook Pro 14-inch",
    description: "Professional laptop with M3 chip for creative work",
    price: 1999.99,
    category: "Electronics",
    stock: 25,
    images: []
  },
  {
    name: "Sony WH-1000XM5",
    description: "Premium noise-cancelling wireless headphones",
    price: 349.99,
    category: "Electronics",
    stock: 40,
    images: []
  },
  {
    name: "Dell XPS 13",
    description: "Ultra-thin laptop with InfinityEdge display",
    price: 1299.99,
    category: "Electronics",
    stock: 35,
    images: []
  },
  {
    name: "Apple Watch Series 9",
    description: "Smartwatch with health monitoring and fitness tracking",
    price: 399.99,
    category: "Electronics",
    stock: 60,
    images: []
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing products
      await Product.deleteMany({});
      console.log('Cleared existing products');
      
      // Insert sample products
      const products = await Product.insertMany(sampleProducts);
      console.log(`Successfully added ${products.length} products to database`);
      
      // Display added products
      products.forEach(product => {
        console.log(`- ${product.name}: $${product.price}`);
      });
      
    } catch (error) {
      console.error('Error seeding products:', error);
    } finally {
      mongoose.connection.close();
      console.log('Database connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 