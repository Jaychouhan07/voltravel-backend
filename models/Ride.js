const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  rideType: {
    type: String,
    enum: ['railway', 'airport', 'intercity', 'custom'],
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  dropAddress: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'cash', 'pass'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['confirmed', 'driver_assigned', 'started', 'completed', 'cancelled'],
    default: 'confirmed',
  },
  isPassRide: {
    type: Boolean,
    default: false,
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Ride', rideSchema);