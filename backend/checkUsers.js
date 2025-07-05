const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const checkUsers = async () => {
  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    const orders = await Order.find({}).populate('user', 'name email');
    console.log(`\nFound ${orders.length} orders:`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order._id.toString().slice(-8)} - User: ${order.user?.name || 'Unknown'} - Status: ${order.status} - Amount: $${order.totalAmount}`);
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUsers(); 