require('dotenv').config();
console.log('Loaded ENV:', process.env);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();

// Configure CORS to allow requests from Netlify and other origins
app.use(cors({
  origin: [
    'https://shopee-1.netlify.app',
    'https://shopee-o2b3.onrender.com',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true
}));

app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      console.error('Please set up MongoDB Atlas and update your MONGODB_URI');
      process.exit(1);
    }
    
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please check your MONGODB_URI and ensure MongoDB Atlas is accessible');
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Add middleware to log all requests (BEFORE routes)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic routes first
app.get('/', (req, res) => {
  res.send('Shopee API is running!');
});

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Add back the product routes with debugging
console.log('Loading product routes...');
try {
  const productRoutes = require('./routes/productRoutes');
  app.use('/api/products', productRoutes);
  console.log('✅ Product routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading product routes:', error);
}

// Add back the user routes
console.log('Loading user routes...');
try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading user routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
}); 