const express = require('express');
const router = express.Router();
const Pass = require('../models/Pass');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// POST /api/pass/activate
// Activate a new pass
router.post('/activate', authMiddleware, async (req, res) => {
  try {
    const { planType, paymentId } = req.body;

    // Plan details
    const plans = {
      weekly: {
        name: 'Weekly Commuter',
        price: 299,
        days: 7,
        dailyKm: 10,
        roundTrips: 1,
      },
      monthly: {
        name: 'Monthly Commuter',
        price: 999,
        days: 30,
        dailyKm: 10,
        roundTrips: 1,
      },
      quarterly: {
        name: 'Quarterly Commuter',
        price: 2499,
        days: 90,
        dailyKm: 35,
        roundTrips: 1,
      }
    };

    const plan = plans[planType];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.days);

    // Create pass
    const pass = new Pass({
      userId: req.user.userId,
      planType,
      planName: plan.name,
      price: plan.price,
      dailyKm: plan.dailyKm,
      roundTrips: plan.roundTrips,
      passId: 'VP-' + Math.floor(10000 + Math.random() * 90000),
      activatedAt: new Date(),
      expiryDate,
      status: 'active',
      paymentId,
    });

    await pass.save();

    // Update user hasPass flag
    await User.findByIdAndUpdate(req.user.userId, { 
      hasPass: true,
      activePassId: pass._id 
    });

    res.json({
      success: true,
      message: `${plan.name} activated successfully!`,
      pass: {
        passId: pass.passId,
        planName: pass.planName,
        expiryDate: pass.expiryDate,
        dailyKm: pass.dailyKm,
        roundTrips: pass.roundTrips,
        status: pass.status,
      }
    });

  } catch (error) {
    console.error('Pass activation error:', error);
    res.status(500).json({ message: 'Pass activation failed' });
  }
});

// GET /api/pass/my-pass
// Get active pass for logged in user
router.get('/my-pass', authMiddleware, async (req, res) => {
  try {
    const pass = await Pass.findOne({
      userId: req.user.userId,
      status: 'active',
      expiryDate: { $gte: new Date() }
    });

    if (!pass) {
      return res.json({ 
        success: true, 
        hasPass: false,
        message: 'No active pass found' 
      });
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (pass.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      success: true,
      hasPass: true,
      pass: {
        passId: pass.passId,
        planName: pass.planName,
        expiryDate: pass.expiryDate,
        daysRemaining,
        dailyKm: pass.dailyKm,
        roundTrips: pass.roundTrips,
        status: pass.status,
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pass' });
  }
});

// POST /api/pass/cancel
// Cancel active pass
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const pass = await Pass.findOneAndUpdate(
      { userId: req.user.userId, status: 'active' },
      { status: 'cancelled' },
      { new: true }
    );

    if (!pass) {
      return res.status(404).json({ message: 'No active pass found' });
    }

    await User.findByIdAndUpdate(req.user.userId, { 
      hasPass: false,
      activePassId: null 
    });

    res.json({ 
      success: true, 
      message: 'Pass cancelled successfully' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed' });
  }
});

module.exports = router;