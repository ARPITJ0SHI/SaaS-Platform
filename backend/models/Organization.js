const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  activePlan: {
    name: String,
    maxUsers: Number,
    features: [String],
    price: Number,
    billingCycle: String,
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'trialing', 'canceled', 'expired'],
    default: 'trialing',
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now,
  },
  subscriptionEndDate: {
    type: Date,
    required: true,
  },
  stripeCustomerId: {
    type: String,
  },
  stripeSubscriptionId: {
    type: String,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});


organizationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Organization', organizationSchema); 