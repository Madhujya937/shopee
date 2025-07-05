const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Product = require('./models/Product');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const debugOrderCreation = async () => {
  try {
    // Check if there are any users
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Created test user:', testUser._id);
    }

    // Check if there are any products
    const products = await Product.find({});
    console.log(`\nFound ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Price: $${product.price} - Stock: ${product.stock}`);
    });

    if (products.length === 0) {
      console.log('No products found. Please run seedProducts.js first.');
      return;
    }

    // Check if there are any carts
    const carts = await Cart.find({}).populate('user', 'name email');
    console.log(`\nFound ${carts.length} carts:`);
    carts.forEach((cart, index) => {
      console.log(`${index + 1}. User: ${cart.user?.name || 'Unknown'} - Items: ${cart.items.length}`);
    });

    // Check if there are any orders
    const orders = await Order.find({}).populate('user', 'name email');
    console.log(`\nFound ${orders.length} orders:`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order._id.toString().slice(-8)} - User: ${order.user?.name || 'Unknown'} - Status: ${order.status} - Amount: $${order.totalAmount}`);
    });

    // Test order creation with a specific user and product
    const testUser = users[0] || await User.findOne({});
    const testProduct = products[0];

    if (testUser && testProduct) {
      console.log(`\nTesting order creation for user: ${testUser.name} with product: ${testProduct.name}`);
      
      // Create a cart for the test user
      let cart = await Cart.findOne({ user: testUser._id });
      if (!cart) {
        cart = await Cart.create({ user: testUser._id, items: [] });
        console.log('Created new cart for test user');
      }

      // Add product to cart
      cart.items = [{ product: testProduct._id, quantity: 1 }];
      await cart.save();
      console.log('Added product to cart');

      // Try to create an order
      const order = await Order.create({
        user: testUser._id,
        products: [{ product: testProduct._id, quantity: 1 }],
        totalAmount: testProduct.price,
        status: 'pending',
        paymentStatus: 'pending',
        shippingInfo: { address: 'Test Address', phone: '1234567890' }
      });

      console.log('Order created successfully:', order._id);
      console.log('Order details:', {
        user: order.user,
        totalAmount: order.totalAmount,
        status: order.status,
        products: order.products.length
      });
    }

  } catch (error) {
    console.error('Error during debug:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugOrderCreation(); 