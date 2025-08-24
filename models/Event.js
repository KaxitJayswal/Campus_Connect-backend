// 1. Import mongoose
const mongoose = require('mongoose');

// 2. Define the Event Schema
const eventSchema = new mongoose.Schema({
  // - title, description, date, venue, college, category: all are Strings and required
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }, // Changed from String to Date
  venue: { type: String, required: true },
  college: { type: String, required: true },
  category: { type: String, required: true },
  // - organizer: an ObjectId referencing the 'User' model, required
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // - registrationLink: a String, not required
  registrationLink: { type: String }
}, {
  // - Add timestamps
  timestamps: true
});

// Add text index for search functionality
eventSchema.index({ 
  title: 'text', 
  description: 'text', 
  college: 'text', 
  category: 'text' 
});

// 3. Create and export the Event model
module.exports = mongoose.model('Event', eventSchema);
