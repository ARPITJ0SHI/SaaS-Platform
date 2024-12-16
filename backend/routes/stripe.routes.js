const express = require('express');
const router = express.Router();


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




const { auth, authorize } = require('../middleware/auth');
const Organization = require('../models/Organization');
const Plan = require('../models/Plan');
const User = require('../models/User');


router.use('/webhook', express.raw({ type: 'application/json' }));

router.use(express.json());


router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    console.log('Creating subscription for plan:', planId);

    const [organization, plan] = await Promise.all([
      Organization.findById(req.user.organizationId),
      Plan.findById(planId)
    ]);

    if (!plan) {
      console.error('Plan not found:', planId);
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (!plan.stripePriceId) {
      console.error('Plan does not have a Stripe price ID:', plan);
      return res.status(400).json({ message: 'Invalid plan configuration' });
    }

    console.log('Found plan:', {
      name: plan.name,
      price: plan.price,
      stripePriceId: plan.stripePriceId
    });

    
    let customer;
    if (organization.stripeCustomerId) {
      customer = await stripe.customers.retrieve(organization.stripeCustomerId);
      console.log('Retrieved existing Stripe customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          organizationId: organization._id.toString()
        }
      });
      organization.stripeCustomerId = customer.id;
      await organization.save();
      console.log('Created new Stripe customer:', customer.id);
    }

    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart?canceled=true`,
      metadata: {
        organizationId: organization._id.toString(),
        planId: planId.toString()
      }
    });

    console.log('Created Stripe checkout session:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


router.post('/webhook', async (req, res) => {
  console.log('Received webhook event');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
   
    console.log('Verifying webhook signature with raw body');
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Webhook verified. Event type:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    console.error('Signature:', sig);
    console.error('Webhook Secret:', process.env.STRIPE_WEBHOOK_SECRET ? '✓ Set' : '✗ Missing');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log('Processing webhook event:', event.type);
    const eventData = event.data.object;
    
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Checkout session completed:', {
          sessionId: eventData.id,
          customerId: eventData.customer,
          subscriptionId: eventData.subscription,
          metadata: eventData.metadata
        });

        const organizationId = eventData.metadata.organizationId;
        const planId = eventData.metadata.planId;

        console.log('Looking up organization and plan:', { organizationId, planId });

        const [organization, plan] = await Promise.all([
          Organization.findById(organizationId),
          Plan.findById(planId)
        ]);

        if (!organization || !plan) {
          console.error('Organization or plan not found:', { 
            organizationFound: !!organization, 
            planFound: !!plan,
            organizationId,
            planId 
          });
          return res.status(404).json({ message: 'Organization or plan not found' });
        }

        console.log('Found organization and plan:', {
          organizationId: organization._id,
          planName: plan.name,
          planPrice: plan.price
        });

        
        organization.planId = plan._id;
        organization.stripeSubscriptionId = eventData.subscription;
        organization.subscriptionStatus = 'active';
        organization.subscriptionStartDate = new Date();
        organization.subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        
      
        organization.activePlan = {
          name: plan.name,
          maxUsers: plan.maxUsers,
          features: plan.features,
          price: plan.price,
          billingCycle: plan.billingCycle,
          storage: plan.storage
        };

        await organization.save();
        console.log('Organization updated successfully:', {
          id: organization._id,
          plan: plan.name,
          status: organization.subscriptionStatus,
          endDate: organization.subscriptionEndDate
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer
        });

        const organization = await Organization.findOne({ stripeSubscriptionId: subscription.id });
        
        if (!organization) {
          console.error('Organization not found for subscription:', subscription.id);
          return res.status(404).json({ message: 'Organization not found' });
        }

        console.log('Found organization:', {
          id: organization._id,
          currentPlan: organization.activePlan?.name,
          currentStatus: organization.subscriptionStatus
        });

        const plan = await Plan.findOne({ stripePriceId: subscription.items.data[0].price.id });
        if (!plan) {
          console.error('Plan not found for price:', subscription.items.data[0].price.id);
          return res.status(404).json({ message: 'Plan not found' });
        }

        console.log('Found plan:', {
          id: plan._id,
          name: plan.name,
          priceId: plan.stripePriceId
        });

        
        organization.subscriptionStatus = subscription.status;
        organization.planId = plan._id;
        organization.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        
       
        organization.activePlan = {
          name: plan.name,
          maxUsers: plan.maxUsers,
          features: plan.features,
          price: plan.price,
          billingCycle: plan.billingCycle,
          storage: plan.storage
        };

        
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          organization.subscriptionStatus = 'expired';
        }

        await organization.save();
        console.log('Organization subscription updated:', {
          id: organization._id,
          plan: plan.name,
          status: organization.subscriptionStatus,
          endDate: organization.subscriptionEndDate
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const organization = await Organization.findOne({ stripeSubscriptionId: subscription.id });
        
        if (organization) {
         
          const basicPlan = await Plan.findOne({ name: 'Basic' });
          if (basicPlan) {
            organization.planId = basicPlan._id;
            organization.subscriptionStatus = 'expired';
            organization.activePlan = {
              name: basicPlan.name,
              maxUsers: basicPlan.maxUsers,
              features: basicPlan.features,
              price: basicPlan.price,
              billingCycle: basicPlan.billingCycle
            };
            await organization.save();
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


router.get('/subscription', auth, async (req, res) => {
  try {
    console.log('Fetching subscription details for organization:', req.user.organizationId);
    
    const organization = await Organization.findById(req.user.organizationId)
      .populate('planId');

    if (!organization) {
      console.error('Organization not found:', req.user.organizationId);
      return res.status(404).json({ message: 'Organization not found' });
    }

    console.log('Found organization:', {
      id: organization._id,
      plan: organization.planId?.name,
      activePlan: organization.activePlan,
      status: organization.subscriptionStatus
    });

    
    let stripeSubscription = null;
    if (organization.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(organization.stripeSubscriptionId);
        console.log('Retrieved Stripe subscription:', stripeSubscription.id);
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    res.json({
      organization: {
        id: organization._id,
        name: organization.name,
        email: organization.email,
        activePlan: organization.activePlan,
        subscriptionStatus: organization.subscriptionStatus,
        subscriptionEndDate: organization.subscriptionEndDate
      },
      plan: organization.planId,
      subscription: {
        status: organization.subscriptionStatus,
        maxUsers: organization.activePlan?.maxUsers || organization.planId?.maxUsers,
        endDate: organization.subscriptionEndDate,
        stripeSubscription: stripeSubscription
      }
    });
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ message: error.message });
  }
});




module.exports = router; 