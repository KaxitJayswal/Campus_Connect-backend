// 1. Import mongoose
const mongoose = require('mongoose');

// 2. Define the User Schema
const userSchema = new mongoose.Schema({
  // - name: String, required
  name: { type: String, required: true },
  // - email: String, required, unique
  email: { type: String, required: true, unique: true },
  // - password: String, required
  password: { type: String, required: true },
  // - college: String
  college: { type: String },
  // - role: String, with possible values 'student', 'organizer', or 'admin', defaulting to 'student'
  role: { 
    type: String, 
    enum: ['student', 'organizer', 'admin'], 
    default: 'student' 
  },
  // - organizerStatus: tracks the application status for becoming an organizer
  organizerStatus: {
    type: String,
    enum: ['none', 'pending', 'approved'],
    default: 'none'
  },
  // - savedEvents: An array of ObjectIds, referencing the 'Event' model
  savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, {
  // - Add timestamps for createdAt and updatedAt
  timestamps: true
});

// 3. Create and export the User model from the schema
module.exports = mongoose.model('User', userSchema);
