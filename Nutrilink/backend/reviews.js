const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// Get all approved reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new review
router.post('/', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = new Review({
      userId: req.user._id,
      rating,
      comment
    });
    const newReview = await review.save();
    await newReview.populate('userId', 'name');
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's own reviews
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a review
router.patch('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment) review.comment = req.body.comment;
    
    const updatedReview = await review.save();
    await updatedReview.populate('userId', 'name');
    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 