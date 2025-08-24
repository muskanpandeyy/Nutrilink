const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  receiverName: {
    type: String,
    required: true,
    trim: true
  },
  receiverContact: {
    type: String,
    required: true,
    trim: true
  },
  receiverLocation: {
    type: String,
    required: true,
    trim: true
  },
  // Optional fields
  age: {
    type: Number,
    required: false,
    min: 0
  },
  sourceOfIncome: {
    type: String,
    required: false,
    trim: true
  },
  familyDetails: {
    type: String,
    required: false,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  message: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
requestSchema.index({ userId: 1 });
requestSchema.index({ donationId: 1 });
requestSchema.index({ status: 1 });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request; 