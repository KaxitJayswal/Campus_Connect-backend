// 1. Import express and create a router
const express = require('express');
const router = express.Router();

// 2. Import the Event model
const Event = require('../models/Event');

// 3. Import the 'protect' middleware we created earlier
const { protect } = require('../middleware/authMiddleware');

// 4. Define a POST route at the root URL ('/') for creating an event
//    a. This route should be protected by the 'protect' middleware
router.post('/', protect, async (req, res) => {
  // 5. The route handler should be asynchronous and use a try-catch block
  try {
    // 6a. First, check if the logged-in user's role (from req.user.role) is 'organizer'.
    if (req.user.role !== 'organizer') {
      // 6b. If the user is not an organizer, return a 403 (Forbidden) status with a message
      return res.status(403).json({ message: 'User not authorized to create events' });
    }

    // 6c. If the user is an organizer, destructure the event details from req.body
    const { title, description, date, venue, college, category, registrationLink } = req.body;

    // 6d. Create a new event object using the Event model. Add the organizer's ID from req.user.id
    const event = new Event({
      title,
      description,
      date,
      venue,
      college,
      category,
      registrationLink,
      organizer: req.user._id
    });

    // 6e. Save the new event to the database
    await event.save();

    // 6f. Respond with a 201 (Created) status and the newly created event data
    res.status(201).json(event);

  } catch (error) {
    // 7. In the catch block, log the error and send a 500 'Server error' message
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/events - ADVANCED Fetch
router.get('/', async (req, res) => {
    try {
        const { college, category, search, dateFilter } = req.query;
        let filter = {};

        // Add college and category filters
        if (college) filter.college = college;
        if (category) filter.category = category;

        // Date filtering logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only apply date filter if specifically requested
        if (dateFilter === 'past') {
            filter.date = { $lt: today };
        } else if (dateFilter === 'upcoming') {
            filter.date = { $gte: today };
        }
        // If no dateFilter specified, show all events (no date filter applied)

        let events;

        // If a search term is provided, use MongoDB's text search
        if (search) {
            filter.$text = { $search: search };
            events = await Event.find(filter)
                .sort(dateFilter === 'past' ? { date: -1 } : { date: 1 });
        } else {
            events = await Event.find(filter)
                .sort(dateFilter === 'past' ? { date: -1 } : { date: 1 });
        }

        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/events/myevents
// @desc    Get all events for the logged-in organizer
// @access  Private
router.get('/myevents', protect, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id }).sort({ date: -1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 1. Define a public GET route at '/:id' to fetch a single event
// The handler should be async and use a try-catch block
router.get('/:id', async (req, res) => {
  try {
    // 2a. Find the event by its ID using Event.findById(req.params.id)
    // 2b. To also fetch the organizer's details, chain the .populate() method. Populate the 'organizer' field with their 'name' and 'email'.
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    // 2c. If no event is found for the given ID, return a 404 (Not Found) status with an 'Event not found' message
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // 2d. If the event is found, respond with a 200 (OK) status and the event object
    res.status(200).json(event);
  } catch (error) {
    // 3. In the catch block, send a 500 'Server error' message
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Ensure user owns the event
        if (event.organizer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(event);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        if (event.organizer.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Event removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 8. Export the router
module.exports = router;
