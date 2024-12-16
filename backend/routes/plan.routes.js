const express = require('express');
const { body, validationResult } = require('express-validator');
const Plan = require('../models/Plan');
const { auth, authorize } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();


router.get('/public', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/',
  auth,
  authorize('superadmin'),
  [
    body('name').isIn(['Basic', 'Standard', 'Plus']),
    body('price').isNumeric(),
    body('maxUsers').isNumeric(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, price, features, maxUsers, storage, billingCycle, trialDays } = req.body;

      if (!billingCycle || !['Trial', 'Monthly', 'Yearly'].includes(billingCycle)) {
        return res.status(400).json({ message: 'Invalid billing cycle. Must be Trial, Monthly, or Yearly' });
      }

      if (!Array.isArray(features) || features.length === 0) {
        return res.status(400).json({ message: 'Features must be a non-empty array' });
      }

      let stripePrice;
      try {
    
        const stripeProduct = await stripe.products.create({
          name: `${name} Plan`,
          description: `${name} Plan with ${maxUsers} users and ${storage}GB storage`,
        });

        const interval = billingCycle.toLowerCase() === 'monthly' ? 'month' : 'year';
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: price * 100, // Convert to cents
          currency: 'inr',
          recurring: billingCycle === 'Trial' ? undefined : {
            interval: interval,
          },
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return res.status(500).json({ 
          message: 'Failed to create Stripe price',
          details: stripeError.message
        });
      }

      if (!stripePrice || !stripePrice.id) {
        return res.status(500).json({ 
          message: 'Failed to create Stripe price - no price ID returned'
        });
      }

      const plan = new Plan({
        name,
        price,
        features,
        maxUsers,
        storage,
        billingCycle,
        trialDays,
        stripePriceId: stripePrice.id,
        isActive: true
      });

      await plan.save();
      res.status(201).json(plan);
    } catch (error) {
      console.error('Error creating plan:', error);
      res.status(500).json({ 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);


router.put('/:id',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const plan = await Plan.findById(id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

     
      if (updates.price !== undefined || updates.billingCycle !== undefined) {
        const stripeProduct = await stripe.products.create({
          name: `${updates.name || plan.name} Plan`,
          description: `${updates.name || plan.name} Plan with ${updates.maxUsers || plan.maxUsers} users and ${updates.storage || plan.storage}GB storage`,
        });

        const interval = (updates.billingCycle || plan.billingCycle).toLowerCase() === 'monthly' ? 'month' : 'year';
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: (updates.price || plan.price) * 100, // Convert to cents
          currency: 'inr',
          recurring: {
            interval: interval,
          },
        });

      
        if (plan.stripePriceId) {
          await stripe.prices.update(plan.stripePriceId, { active: false });
        }

        updates.stripePriceId = stripePrice.id;
      }

      Object.assign(plan, updates);
      await plan.save();
      
      res.json(plan);
    } catch (error) {
      console.error('Error updating plan:', error);
      res.status(500).json({ message: error.message });
    }
  }
);


router.delete('/:id',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const plan = await Plan.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      plan.isActive = false;
      await plan.save();
      
      res.json({ message: 'Plan deactivated successfully' });
    } catch (error) {
      console.error('Error deleting plan:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 