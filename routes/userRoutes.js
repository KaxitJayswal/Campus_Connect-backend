const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   GET /api/users/me
// @desc    Get current user's full profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('savedEvents');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/me/events/:id
// @desc    Save an event to user profile
// @access  Private
router.post('/me/events/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.id;

    if (user.savedEvents.includes(eventId)) {
      return res.status(400).json({ msg: 'Event already saved' });
    }

    user.savedEvents.push(eventId);
    await user.save();
    
    // Return the updated user with populated savedEvents
    const updatedUser = await User.findById(req.user.id).select('-password').populate('savedEvents');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/me/events/:id
// @desc    Unsave an event from user profile
// @access  Private
router.delete('/me/events/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const eventId = req.params.id;

    user.savedEvents = user.savedEvents.filter(id => id.toString() !== eventId);
    await user.save();
    
    // Return the updated user with populated savedEvents
    const updatedUser = await User.findById(req.user.id).select('-password').populate('savedEvents');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
