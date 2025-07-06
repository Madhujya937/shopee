const express = require('express');
const Product = require('../models/Product');
const multer = require('multer');
const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

// Create Product
router.post('/', upload.array('images'), async (req, res, next) => {
  try {
    const images = req.files ? req.files.map(f => f.filename) : [];
    console.log('Uploaded images:', images);
    const product = await Product.create({ ...req.body, images });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// Get Products (with pagination & search)
router.get('/', async (req, res, next) => {
  try {
    console.log('GET /api/products - Request received');
    const { page = 1, limit = 10, search = '', category } = req.query;
    console.log('Query params:', { page, limit, search, category });
    
    const query = {
      ...(search && { name: { $regex: search, $options: 'i' } }),
      ...(category && { category })
    };
    console.log('MongoDB query:', query);
    
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (err) { 
    console.error('Error in GET /api/products:', err);
    next(err); 
  }
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
    const images = req.files ? req.files.map(f => f.filename) : [];
    console.log('Updated images:', images);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(images.length > 0 && { images }) },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
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