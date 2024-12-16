const express = require('express');
const { body, validationResult } = require('express-validator');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Plan = require('../models/Plan');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();


router.get('/',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const organizations = await Organization.find()
        .populate('planId')
        .sort({ createdAt: -1 });

     
      const organizationsWithStats = await Promise.all(
        organizations.map(async (org) => {
          const activeUsers = await User.countDocuments({
            organizationId: org._id,
            isActive: true
          });

          const orgObject = org.toObject();
          return {
            ...orgObject,
            activeUsers
          };
        })
      );

      res.json(organizationsWithStats);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.get('/:id',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id)
        .populate('planId');

      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      
      const activeUsers = await User.countDocuments({
        organizationId: organization._id,
        isActive: true
      });

      const orgObject = organization.toObject();
      const orgWithStats = {
        ...orgObject,
        activeUsers
      };

      res.json(orgWithStats);
    } catch (error) {
      console.error('Error fetching organization:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.post('/',
  auth,
  authorize('superadmin'),
  [
    body('name').notEmpty().withMessage('Organization name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('planId').notEmpty().withMessage('Plan ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, planId, adminEmail, adminPassword } = req.body;

      
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      const organization = new Organization({
        name,
        email,
        planId,
        subscriptionStatus: 'active',
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        activeUsers: 0,
        isActive: true
      });

      await organization.save();

      res.status(201).json(organization);
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ message: 'Server error' });
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

      const organization = await Organization.findById(id);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      
      if (updates.planId) {
        const plan = await Plan.findById(updates.planId);
        if (!plan) {
          return res.status(404).json({ message: 'Plan not found' });
        }
      }

      Object.assign(organization, updates);
      await organization.save();

      const updatedOrg = await Organization.findById(id).populate('planId');
      res.json(updatedOrg);
    } catch (error) {
      console.error('Error updating organization:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.delete('/:id',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

    
      organization.isActive = false;
      await organization.save();

     
      await User.updateMany(
        { organizationId: organization._id },
        { isActive: false }
      );

      res.json({ message: 'Organization deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating organization:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/:id/users',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const users = await User.find({
        organizationId: req.params.id
      }).select('-password');

      res.json(users);
    } catch (error) {
      console.error('Error fetching organization users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.post('/:id/toggle-status',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }

  
      organization.isActive = !organization.isActive;
      await organization.save();

   
      await User.updateMany(
        { organizationId: organization._id },
        { isActive: organization.isActive }
      );

      res.json({ 
        message: `Organization ${organization.isActive ? 'activated' : 'deactivated'} successfully`,
        isActive: organization.isActive 
      });
    } catch (error) {
      console.error('Error toggling organization status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.delete('/:id/permanent',
  auth,
  authorize('superadmin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.id);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }


      await User.deleteMany({ organizationId: organization._id });
      
 
      await Organization.findByIdAndDelete(req.params.id);

      res.json({ message: 'Organization permanently deleted' });
    } catch (error) {
      console.error('Error deleting organization:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router; 