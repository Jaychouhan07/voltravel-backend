const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const authMiddleware = require('../middleware/auth');

// POST /api/rides/book
// Book a new ride
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const {
      pickupAddress,
      dropAddress,
      rideType,
      scheduledTime,
      scheduledDate,
      paymentMethod,
      fare
    } = req.body;

    const ride = new Ride({
      userId: req.user.userId,
      pickupAddress,
      dropAddress,
      rideType,
      scheduledTime,
      scheduledDate,
      paymentMethod,
      fare,
      status: 'confirmed',
      bookingId: 'VT-' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date()
    });

    await ride.save();

    res.json({
      success: true,
      message: 'Ride booked successfully!',
      ride: {
        bookingId: ride.bookingId,
        status: ride.status,
        scheduledTime: ride.scheduledTime,
        scheduledDate: ride.scheduledDate,
        fare: ride.fare,
        pickupAddress: ride.pickupAddress,
        dropAddress: ride.dropAddress,
      }
    });

  } catch (error) {
    console.error('Ride booking error:', error);
    res.status(500).json({ message: 'Booking failed' });
  }
});

// GET /api/rides/my-rides
// Get all rides for logged in user
router.get('/my-rides', authMiddleware, async (req, res) => {
  try {
    const rides = await Ride.find({ 
      userId: req.user.userId 
    }).sort({ createdAt: -1 });

    res.json({ success: true, rides });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rides' });
  }
});

// GET /api/rides/upcoming
// Get upcoming rides only
router.get('/upcoming', authMiddleware, async (req, res) => {
  try {
    const rides = await Ride.find({
      userId: req.user.userId,
      status: 'confirmed',
      scheduledDate: { $gte: new Date() }
    }).sort({ scheduledDate: 1 });

    res.json({ success: true, rides });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch upcoming rides' });
  }
});

// POST /api/rides/cancel
// Cancel a ride
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const ride = await Ride.findOneAndUpdate(
      { bookingId, userId: req.user.userId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json({ 
      success: true, 
      message: 'Ride cancelled successfully',
      ride 
    });

  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed' });
  }
});

// GET /api/rides/:bookingId
// Get single ride details
router.get('/:bookingId', authMiddleware, async (req, res) => {
  try {
    const ride = await Ride.findOne({ 
      bookingId: req.params.bookingId,
      userId: req.user.userId 
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json({ success: true, ride });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ride' });
  }
});

module.exports = router;