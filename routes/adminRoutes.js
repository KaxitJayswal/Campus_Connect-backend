const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Middleware to check for Admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ msg: 'Not authorized as an admin' });
    }
};

// @route   GET /api/admin/pending-organizers
// @desc    Get all users with pending organizer status
// @access  Private/Admin
router.get('/pending-organizers', protect, admin, async (req, res) => {
    try {
        const pending = await User.find({ organizerStatus: 'pending' }).select('-password');
        res.json(pending);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/approve-organizer/:id
// @desc    Approve a user to become an organizer
// @access  Private/Admin
router.put('/approve-organizer/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.organizerStatus !== 'pending') {
                return res.status(400).json({ msg: 'This user does not have a pending application' });
            }
            
            user.role = 'organizer';
            user.organizerStatus = 'approved';
            await user.save();
            res.json({ msg: 'User approved as organizer', user });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/reject-organizer/:id
// @desc    Reject a user's application to become an organizer
// @access  Private/Admin
router.put('/reject-organizer/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.organizerStatus !== 'pending') {
                return res.status(400).json({ msg: 'This user does not have a pending application' });
            }
            
            user.organizerStatus = 'none'; // Reset to none
            await user.save();
            res.json({ msg: 'Application rejected', user });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
