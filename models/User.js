const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    default: 'Voltravel User',
  },
  email: {
    type: String,
    default: '',
  },
  homeAddress: {
    type: String,
    default: '',
  },
  officeAddress: {
    type: String,
    default: '',
  },
  hasPass: {
    type: Boolean,
    default: false,
  },
  activePassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pass',
    default: null,
  },
  trustedContacts: [
    {
      name: String,
      phone: String,
      relation: String,
    }
  ],
  isDriver: {
    type: Boolean,
    default: false,
  },
  driverDetails: {
    vehicleModel: String,
    vehicleNumber: String,
    licenceNumber: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);