const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('./userRoutes');
const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    res.json(cart);
  } catch (err) { next(err); }
});

// Add item to cart
router.post('/add', auth, async (req, res, next) => {
  try {
    console.log('Cart add request received');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    console.log('Cart found:', cart ? 'Yes' : 'No');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
      console.log('Created new cart for user');
    }
    
    const product = await Product.findById(productId);
    console.log('Product found:', product ? product.name : 'No');
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      console.log('Updated existing item quantity');
    } else {
      cart.items.push({ product: productId, quantity });
      console.log('Added new item to cart');
    }
    
    await cart.save();
    console.log('Cart saved successfully');
    res.json(cart);
  } catch (err) { 
    console.error('Error in cart add:', err);
    next(err); 
  }
});

// Update item quantity
router.put('/update', auth, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });
    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) { next(err); }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (err) { next(err); }
});

module.exports = router; 