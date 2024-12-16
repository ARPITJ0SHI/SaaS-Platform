const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Plan = require('../models/Plan');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();


router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('organizationName').notEmpty().withMessage('Organization name is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, organizationName, firstName, lastName } = req.body;

 
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

   
      const basicPlan = await Plan.findOne({ name: 'Basic' });
      if (!basicPlan) {
        return res.status(500).json({ message: 'Basic plan not found' });
      }

     
      const organization = new Organization({
        name: organizationName,
        email: email,
        planId: basicPlan._id,
        subscriptionStatus: 'trialing',
        subscriptionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),  
        isActive: true,
        activePlan: {
          name: basicPlan.name,
          maxUsers: basicPlan.maxUsers,
          features: basicPlan.features,
          price: basicPlan.price,
          billingCycle: basicPlan.billingCycle
        }
      });

      await organization.save();

      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'admin',
        organizationId: organization._id,
        isActive: true
      });

      await user.save();


      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: user.organizationId
        },
        organization: {
          id: organization._id,
          name: organization.name,
          subscriptionStatus: organization.subscriptionStatus,
          isNewOrganization: true
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  }
);


router.post('/register-user',
  auth,
  authorize('admin'),
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty()
  ],
  async (req, res) => {
    try {
      console.log('Register user request received:', {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        organizationId: req.user.organizationId
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName } = req.body;
      
    
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }


      const organization = await Organization.findById(req.user.organizationId)
        .populate('planId');
      
      if (!organization) {
        console.error('Organization not found:', req.user.organizationId);
        return res.status(404).json({ message: 'Organization not found' });
      }

    
      if (organization.subscriptionStatus !== 'active' && organization.subscriptionStatus !== 'trialing') {
        return res.status(400).json({ 
          message: 'Cannot add users: Organization subscription is not active'
        });
      }

      console.log('Organization found:', {
        id: organization._id,
        plan: organization.planId?.name,
        maxUsers: organization.planId?.maxUsers,
        status: organization.subscriptionStatus
      });

  
      const currentUsers = await User.countDocuments({
        organizationId: organization._id,
        isActive: true,
        role: 'user'
      });

      const maxUsers = organization.activePlan?.maxUsers || organization.planId?.maxUsers;

      console.log('User limit check:', {
        currentUsers,
        maxAllowed: maxUsers,
        planName: organization.activePlan?.name || organization.planId?.name
      });

      if (currentUsers >= maxUsers) {
        return res.status(400).json({
          message: `User limit reached (${currentUsers}/${maxUsers}). Please upgrade your plan to add more users.`,
          currentUsers,
          maxUsers,
          planName: organization.activePlan?.name || organization.planId?.name
        });
      }

  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        organizationId: req.user.organizationId,
        role: 'user',
        isActive: true
      });

      await user.save();
      console.log('User created successfully:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      organization.activeUsers = currentUsers + 1;
      await organization.save();

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        organization: {
          currentUsers: currentUsers + 1,
          maxUsers,
          planName: organization.activePlan?.name || organization.planId?.name
        }
      });
    } catch (error) {
      console.error('Error in register-user:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        message: 'Failed to create user',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);


router.post('/login',
  [
    body('email').isEmail(),
    body('password').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email, isActive: true });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const organization = await Organization.findById(user.organizationId);
      const isNewOrganization = organization && 
                               organization.subscriptionStatus === 'trialing' && 
                               !organization.stripeCustomerId;

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          firstName: user.firstName,
          lastName: user.lastName
        },
        organization: organization ? {
          id: organization._id,
          name: organization.name,
          subscriptionStatus: organization.subscriptionStatus,
          isNewOrganization
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.delete('/users/:userId', auth, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    

    const user = await User.findOne({ 
      _id: userId, 
      organizationId: req.user.organizationId 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.deleteOne({ _id: userId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});


module.exports = router; 