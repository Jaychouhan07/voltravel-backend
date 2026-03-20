const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const passRoutes = require('./routes/pass');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/pass', passRoutes);
app.use('/api/user', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '⚡ Voltravel Backend is Live!',
    version: '1.0.0',
    status: 'running'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('✅ MongoDB Connected!');
    app.listen(process.env.PORT, () => {
      console.log(`⚡ Voltravel server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB connection failed:', err.message);
  });