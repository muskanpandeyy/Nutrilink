const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Fruits & Vegetables',
      'Dairy & Eggs',
      'Bread & Bakery',
      'Meat & Seafood',
      'Pantry Items',
      'Prepared Meals',
      'Beverages',
      'Other'
    ]
  },
  quantity: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'expired'],
    default: 'available'
  },
  pickupInstructions: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema); 