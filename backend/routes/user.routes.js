const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();


router.get('/organization',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const users = await User.find({
        organizationId: req.user.organizationId,
        isActive: true,
      }).select('-password');
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.post('/organization',
  auth,
  authorize('admin'),
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organization = await Organization.findById(req.user.organizationId)
        .populate('planId');
      
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      
      const currentUsers = await User.countDocuments({
        organizationId: organization._id,
        isActive: true,
      });

      if (currentUsers >= organization.planId.maxUsers) {
        return res.status(400).json({
          message: 'User limit reached for your plan',
        });
      }

      const { email, password } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        password: hashedPassword,
        organizationId: organization._id,
        role: 'user',
      });

      await user.save();

      
      organization.activeUsers = currentUsers + 1;
      await organization.save();

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.put('/organization/:id',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await User.findOne({
        _id: id,
        organizationId: req.user.organizationId,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      
      delete updates.role;
      
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      Object.assign(user, updates);
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.delete('/organization/:id',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.params.id,
        organizationId: req.user.organizationId,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot deactivate yourself' });
      }

      user.isActive = false;
      await user.save();

      
      const organization = await Organization.findById(req.user.organizationId);
      if (organization) {
        organization.activeUsers--;
        await organization.save();
      }

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.get('/profile',
  auth,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.put('/profile',
  auth,
  async (req, res) => {
    try {
      const updates = req.body;
      
      
      delete updates.role;
      delete updates.organizationId;
      
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await User.findById(req.user._id);
      Object.assign(user, updates);
      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 