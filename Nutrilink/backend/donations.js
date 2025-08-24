const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Get all donations
router.get('/', auth, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations', error: error.message });
  }
});

// Create a donation
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can create donations' });
    }

    const donation = new Donation({
      ...req.body,
      donorId: req.user.userId,
      status: 'available'
    });

    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating donation', error: error.message });
  }
});

// Get donation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email');
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donation', error: error.message });
  }
});

// Update donation
router.put('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating donation', error: error.message });
  }
});

// Delete donation
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting donation', error: error.message });
  }
});

// Get donations by donor
router.get('/donor/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const donations = await Donation.find({ donorId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations', error: error.message });
  }
});

module.exports = router; 