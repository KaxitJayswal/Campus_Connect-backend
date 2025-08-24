// 1. Import required packages: express, cors, dotenv
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Import the connectDB function from the config file
const connectDB = require('./config/db');

// 2. Call the connectDB function to establish a connection
connectDB();

// 2. Initialize an Express application
const app = express();

// 4. Use essential middleware: cors for enabling cross-origin requests and express.json for parsing JSON request bodies
app.use(cors());
app.use(express.json());

// After your middleware section (app.use(cors), app.use(express.json))
// 1. Define and use the authentication routes from the authRoutes.js file, prefixing them with '/api/auth'
app.use('/api/auth', require('./routes/authRoutes'));

// 1. Define and use the event routes from the eventRoutes.js file, prefixing them with '/api/events'
app.use('/api/events', require('./routes/eventRoutes'));

// Add this line for user routes
app.use('/api/users', require('./routes/userRoutes'));

// 5. Define a simple GET route for the root URL ('/') that sends a welcome message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Campus Connect API' });
});

// 6. Define the port number from an environment variable, defaulting to 5000
const PORT = process.env.PORT || 5000;

// 7. Start the server and listen on the defined port, logging a confirmation message to the console
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
