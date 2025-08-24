// 1. Import express and create a router object
const express = require('express');
const router = express.Router();

// 2. Import required models and packages: User model, bcryptjs
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Import the 'protect' middleware from the middleware file
const { protect } = require('../middleware/authMiddleware');

// 3. Define a POST route for '/register'
// This route should be asynchronous
router.post('/register', async (req, res) => {
  // 4. Inside the route handler, destructure name, email, password, college, and role from the request body
  const { name, email, password, college, role } = req.body;

  // 5. Use a try-catch block for error handling
  try {
    // 6. In the try block, first check if a user with the provided email already exists in the database
    const existingUser = await User.findOne({ email });
    // 7. If the user exists, return a 400 status with a JSON message 'User already exists'
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 8. If the user does not exist, create a new user instance from the User model
    const user = new User({
      name,
      email,
      password,
      college,
      role
    });

    // 9. Hash the password. First, generate a salt with bcrypt.genSalt(10)
    const salt = await bcrypt.genSalt(10);
    // 10. Then, hash the user's password using the generated salt and assign it back to the user object
    user.password = await bcrypt.hash(password, salt);

    // 11. Save the new user document to the database
    await user.save();

    // 12. Send a 201 (Created) status with a success JSON message (for now, we can send back the saved user object)
    res.status(201).json({ user });

  } catch (error) {
    // 13. In the catch block, log the error to the console and send a 500 status with a JSON message 'Server error'
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 1. Define a POST route for '/login'
// This route should be asynchronous
router.post('/login', async (req, res) => {
  // 2. Inside the route handler, destructure email and password from the request body
  const { email, password } = req.body;

  // 3. Use a try-catch block for error handling
  try {
    // 4. In the try block, find a user by their email in the database
    const user = await User.findOne({ email });

    // 5. If no user is found, return a 400 status with a JSON message 'Invalid Credentials'
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 6. If a user is found, compare the submitted password with the hashed password in the database using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);

    // 7. If the passwords do not match, return a 400 status with the same 'Invalid Credentials' message (this is for security)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 8. If the passwords match, create a JWT payload containing the user's ID and role
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Add the user's role
      },
    };

    // 9. Sign the token using jwt.sign, the JWT secret from your environment variables, and set an expiration time (e.g., '1h')
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 10. Send a 200 (OK) status with a JSON object containing the token
    res.status(200).json({ token });

  } catch (error) {
    // 11. In the catch block, log the error and send a 500 status with a 'Server error' message
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Define a GET route for '/me'
// 3. Add the 'protect' middleware to this route before the route handler function
// 4. The route handler should receive the request and send back the user data attached to it (req.user)
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// 14. Export the router
module.exports = router;
