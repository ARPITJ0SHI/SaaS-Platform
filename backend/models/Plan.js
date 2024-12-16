const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Standard', 'Plus']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['Trial', 'Monthly', 'Yearly']
  },
  trialDays: {
    type: Number,
    default: 0
  },
  features: [{
    type: String,
    required: true
  }],
  maxUsers: {
    type: Number,
    required: true,
    min: 1
  },
  storage: {
    type: Number,
    required: true,
    min: 1
  },
  stripePriceId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


planSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Plan', planSchema); 