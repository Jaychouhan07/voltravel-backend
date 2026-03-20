const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/auth/verify-otp
// Verify Firebase OTP token and login/register user
router.post('/verify-otp', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number not found' });
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    // If not, create new user
    if (!user) {
      user = new User({
        phone,
        name: 'Voltravel User',
        createdAt: new Date(),
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        hasPass: user.hasPass,
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(401).json({ message: 'Invalid or expired OTP' });
  }
});

// POST /api/auth/update-profile
router.post('/update-profile', async (req, res) => {
  try {
    const { token, name, email } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name, email },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});
// POST /api/auth/demo-login
router.post('/demo-login', async (req, res) => {
  try {
    const { phone } = req.body;
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, name: 'Voltravel User' });
      await user.save();
    }
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ success: true, token, user: {
      id: user._id, name: user.name,
      phone: user.phone, hasPass: user.hasPass
    }});
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;