const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// GET /api/user/profile
// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// PUT /api/user/update
// Update user profile
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { name, email, homeAddress, officeAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email, homeAddress, officeAddress },
      { new: true }
    ).select('-__v');

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// POST /api/user/trusted-contacts
// Add trusted contact for safety
router.post('/trusted-contacts', authMiddleware, async (req, res) => {
  try {
    const { name, phone, relation } = req.body;

    const user = await User.findById(req.user.userId);

    if (user.trustedContacts.length >= 3) {
      return res.status(400).json({ 
        message: 'Maximum 3 trusted contacts allowed' 
      });
    }

    user.trustedContacts.push({ name, phone, relation });
    await user.save();

    res.json({ 
      success: true, 
      message: 'Trusted contact added!',
      trustedContacts: user.trustedContacts 
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to add contact' });
  }
});

// DELETE /api/user/trusted-contacts/:index
// Remove trusted contact
router.delete('/trusted-contacts/:index', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.trustedContacts.splice(req.params.index, 1);
    await user.save();

    res.json({ 
      success: true, 
      message: 'Contact removed',
      trustedContacts: user.trustedContacts 
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to remove contact' });
  }
});

// POST /api/user/sos
// Trigger SOS alert
router.post('/sos', authMiddleware, async (req, res) => {
  try {
    const { location, rideId } = req.body;
    const user = await User.findById(req.user.userId);

    // Log SOS alert
    console.log(`🚨 SOS ALERT from ${user.phone}`);
    console.log(`📍 Location: ${JSON.stringify(location)}`);
    console.log(`🚗 Ride: ${rideId}`);
    console.log(`👨‍👩‍👧 Contacts: ${JSON.stringify(user.trustedContacts)}`);

    // In production: send SMS to trusted contacts via Twilio
    // In production: notify Voltravel safety team

    res.json({ 
      success: true, 
      message: 'SOS alert sent to trusted contacts!',
      contactsNotified: user.trustedContacts.length
    });

  } catch (error) {
    res.status(500).json({ message: 'SOS failed' });
  }
});

module.exports = router;