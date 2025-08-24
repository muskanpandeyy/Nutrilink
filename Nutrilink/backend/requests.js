const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Get my requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.userId })
      .populate({
        path: 'donationId',
        select: 'title status quantity location expiryDate'
      })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new request
router.post('/', auth, async (req, res) => {
  try {
    const { 
      donationId, 
      message, 
      quantity,
      receiverName,
      receiverContact,
      receiverLocation,
      age,
      sourceOfIncome,
      familyDetails
    } = req.body;
    
    // Use userId from auth middleware
    const userId = req.user.userId;
    
    console.log('Creating request with data:', {
      userId,
      donationId,
      receiverName,
      receiverContact,
      receiverLocation,
      message,
      quantity
    });

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    // Validate required fields
    if (!receiverName || !receiverContact || !receiverLocation) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify donation exists and is available
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'This donation is no longer available' });
    }

    if (parseInt(quantity) > parseInt(donation.quantity)) {
      return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
    }

    // Check if user already has a pending request for this donation
    const existingRequest = await Request.findOne({
      userId,
      donationId: donationId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have a pending request for this donation',
        requestStatus: existingRequest.status
      });
    }

    // Create new request
    const request = new Request({
      userId,
      donationId,
      receiverName,
      receiverContact,
      receiverLocation,
      message: message || 'Interested in this donation',
      quantity: parseInt(quantity),
      status: 'pending'
    });

    // Add optional fields if they exist
    if (age) request.age = parseInt(age);
    if (sourceOfIncome) request.sourceOfIncome = sourceOfIncome;
    if (familyDetails) request.familyDetails = familyDetails;

    console.log('Saving request:', request);

    const savedRequest = await request.save();
    console.log('Request saved successfully:', savedRequest);

    const populatedRequest = await Request.findById(savedRequest._id)
      .populate('donationId')
      .populate('userId', 'name email');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Failed to create request', error: error.message });
  }
});

// Update request status (approve/reject)
router.put('/:id/:action', auth, async (req, res) => {
  try {
    const { id, action } = req.params;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify the donation belongs to the current user
    const donation = await Donation.findById(request.donationId);
    if (!donation || donation.donorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';
    
    if (action === 'approve') {
      // Update donation quantity
      if (donation.quantity < request.quantity) {
        return res.status(400).json({ message: 'Insufficient quantity available' });
      }
      donation.quantity -= request.quantity;
      await donation.save();
    }

    await request.save();
    await request.populate('donationId');
    
    res.json(request);
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify the request belongs to the current user
    if (request.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete processed request' });
    }

    await request.deleteOne();
    res.json({ message: 'Request deleted' });
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark request as collected
router.put('/:id/collect', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Verify the request belongs to the current user
    if (request.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved requests can be marked as collected' });
    }

    request.status = 'collected';
    await request.save();

    // Update the donation status to completed
    const donation = await Donation.findById(request.donationId);
    if (donation) {
      donation.status = 'completed';
      await donation.save();
    }

    res.json({ message: 'Request marked as collected successfully', request });
  } catch (err) {
    console.error('Error marking request as collected:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get requests by donation ID
router.get('/donation/:donationId', auth, async (req, res) => {
  try {
    const requests = await Request.find({ donationId: req.params.donationId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get request history for a donor
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the user is requesting their own history
    if (userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this history' });
    }

    // Find all donations by the donor
    const donations = await Donation.find({ donorId: userId });
    const donationIds = donations.map(d => d._id);

    // Find all requests for these donations
    const requests = await Request.find({ donationId: { $in: donationIds } })
      .populate('userId', 'name email')
      .populate('donationId', 'title quantity')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching request history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 