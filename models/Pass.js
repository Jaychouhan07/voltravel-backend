const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  passId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planType: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  dailyKm: {
    type: Number,
    required: true,
  },
  roundTrips: {
    type: Number,
    default: 1,
  },
  activatedAt: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  paymentId: {
    type: String,
    default: '',
  },
  ridesUsedToday: {
    type: Number,
    default: 0,
  },
  kmUsedToday: {
    type: Number,
    default: 0,
  },
  lastUsedDate: {
    type: Date,
    default: null,
  },
  totalRidesUsed: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pass', passSchema);