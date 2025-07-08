const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Cloudinary setup
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shopee-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});
const upload = multer({ storage });

// Create Product
router.post('/', upload.array('images'), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      console.error('No files uploaded');
      return res.status(400).json({ message: 'No images uploaded' });
    }
    // Cloudinary URLs
    const images = req.files.map(f => f.path || f.url || (f.cloudinary && f.cloudinary.url));
    console.log('Cloudinary image URLs:', images);
    const product = await Product.create({ ...req.body, images });
    res.status(201).json(product);
  } catch (err) {
    console.error('Error uploading product image:', err);
    next(err);
  }
});

// Get Products (with pagination & search)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category } = req.query;
    const query = {
      ...(search && { name: { $regex: search, $options: 'i' } }),
      ...(category && { category })
    };
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(products);
  } catch (err) { next(err); }
});

// Get Product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// Update Product
router.put('/:id', upload.array('images'), async (req, res, next) => {
  try {
    // Always extract Cloudinary URLs, just like in POST
    const images = req.files && req.files.length > 0
      ? req.files.map(f => f.path || f.url || (f.cloudinary && f.cloudinary.url))
      : undefined;
    const updateData = { ...req.body };
    if (images) updateData.images = images;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error updating product image:', err);
    next(err);
  }
});

// Delete Product
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
});

module.exports = router; 