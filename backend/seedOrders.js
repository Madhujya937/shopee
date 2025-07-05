const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const seedOrders = async () => {
  try {
    // Get a user (assuming you have one)
    const user = await User.findOne();
    if (!user) {
      console.log('No user found. Please create a user first.');
      return;
    }

    // Get some products
    const products = await Product.find().limit(3);
    if (products.length === 0) {
      console.log('No products found. Please create products first.');
      return;
    }

    // Clear existing orders
    await Order.deleteMany({});

    // Create test orders with different statuses
    const testOrders = [
      {
        user: user._id,
        products: [
          { product: products[0]._id, quantity: 2 },
          { product: products[1]._id, quantity: 1 }
        ],
        totalAmount: products[0].price * 2 + products[1].price,
        status: 'pending',
        paymentStatus: 'pending',
        shippingInfo: {
          address: '123 Main St, City, State 12345',
          phone: '+1 234 567 8900'
        }
      },
      {
        user: user._id,
        products: [
          { product: products[0]._id, quantity: 1 }
        ],
        totalAmount: products[0].price,
        status: 'processing',
        paymentStatus: 'paid',
        shippingInfo: {
          address: '456 Oak Ave, City, State 12345',
          phone: '+1 234 567 8901'
        }
      },
      {
        user: user._id,
        products: [
          { product: products[0]._id, quantity: 1 },
          { product: products[1]._id, quantity: 3 }
        ],
        totalAmount: products[0].price + products[1].price * 3,
        status: 'shipped',
        paymentStatus: 'paid',
        shippingInfo: {
          address: '789 Pine Rd, City, State 12345',
          phone: '+1 234 567 8902'
        }
      },
      {
        user: user._id,
        products: [
          { product: products[1]._id, quantity: 2 }
        ],
        totalAmount: products[1].price * 2,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingInfo: {
          address: '321 Elm St, City, State 12345',
          phone: '+1 234 567 8903'
        }
      }
    ];

    const createdOrders = await Order.insertMany(testOrders);
    console.log(`Created ${createdOrders.length} test orders:`);
    
    createdOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}: ${order.status} - $${order.totalAmount}`);
    });

    console.log('Test orders seeded successfully!');
  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedOrders(); 