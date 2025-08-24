const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: 'This email is already subscribed to our newsletter' 
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        await existingSubscription.save();
        return res.json({ 
          success: true, 
          message: 'Welcome back! Your subscription has been reactivated' 
        });
      }
    }

    // Create new subscription
    const subscription = new Newsletter({ email });
    await subscription.save();

    res.json({ 
      success: true, 
      message: 'Thank you for subscribing to our newsletter!' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe. Please try again later.' 
    });
  }
});

module.exports = router; 