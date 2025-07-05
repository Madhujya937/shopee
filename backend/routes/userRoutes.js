const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ email, password, name });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Log registration
    console.log('New user registered:', { id: user._id, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) { next(err); }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Log login
    console.log('User logged in:', { id: user._id, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) { next(err); }
});

// Register Seller
router.post('/register-seller', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ email, password, name, role: 'seller' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('New seller registered:', { id: user._id, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) { next(err); }
});

// Login Seller
router.post('/login-seller', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'seller' });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Seller logged in:', { id: user._id, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) { next(err); }
});

// JWT Middleware
const auth = (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Authorization header:', req.headers.authorization);
  
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Extracted token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.log('Token verified successfully, user ID:', decoded.id);
    req.user = decoded;
    next();
  });
};

module.exports = router;
module.exports.auth = auth; 