require('dotenv').config();
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY);
const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-payment-intent', async (req, res, next) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd'
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) { next(err); }
});

module.exports = router; 