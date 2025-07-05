const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('./userRoutes');
const router = express.Router();

// Place order
router.post('/', auth, async (req, res, next) => {
  try {
    console.log('Order creation request received');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    console.log('Cart found:', cart ? 'Yes' : 'No');
    console.log('Cart items:', cart ? cart.items.length : 0);
    
    if (!cart || cart.items.length === 0) {
      console.log('Cart is empty or not found');
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    let totalAmount = 0;
    for (const item of cart.items) {
      console.log('Checking item:', item.product.name, 'Stock:', item.product.stock, 'Quantity:', item.quantity);
      if (item.product.stock < item.quantity) {
        console.log('Insufficient stock for:', item.product.name);
        return res.status(400).json({ message: `Not enough stock for ${item.product.name}` });
      }
      totalAmount += item.product.price * item.quantity;
    }
    
    console.log('Total amount calculated:', totalAmount);
    
    // Reduce stock
    for (const item of cart.items) {
      item.product.stock -= item.quantity;
      await item.product.save();
      console.log('Reduced stock for:', item.product.name, 'New stock:', item.product.stock);
    }
    
    const order = await Order.create({
      user: req.user.id,
      products: cart.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      shippingInfo: req.body.shippingInfo || {}
    });
    
    console.log('Order created successfully:', order._id);
    
    // Clear cart
    cart.items = [];
    await cart.save();
    console.log('Cart cleared');
    
    res.status(201).json(order);
  } catch (err) { 
    console.error('Error in order creation:', err);
    next(err); 
  }
});

// Get user's orders
router.get('/', auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('products.product');
    res.json(orders);
  } catch (err) { next(err); }
});

// Update order status (admin only, simple check)
router.put('/:id/status', auth, async (req, res, next) => {
  try {
    // In production, check req.user.isAdmin
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

module.exports = router; 