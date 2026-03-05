const mongoose = require('mongoose');

// MongoDB Schema with nested documents
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  location: {
    type: String,
    default: 'Not specified',
  },
  // Media files (images/videos)
  media: [
    {
      url: { type: String, required: true },
      type: { type: String },
      filename: { type: String },
    },
  ],
  // Reference to User who created the event
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: {
    type: Number,
    default: 0,
  },
  // NEW: Archive status
  isArchived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  archiveReason: {
    type: String,
    enum: ['deleted_by_organizer', 'auto_archived_after_event', null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



// Index for archived events
EventSchema.index({ isArchived: 1, date: 1 });

// Virtual to check if event is past
EventSchema.virtual('isPast').get(function() {
  return new Date(this.date) < new Date();
});

//Creates a virtual field called isPast that: ->Is not stored in the database ->Calculated when needed

// Ensure virtuals are included in JSON
EventSchema.set('toJSON', { virtuals: true });
//Ensures virtual fields (like isPast) are included when converting MongoDB documents to JSON.

EventSchema.set('toObject', { virtuals: true });
//toObject → used internally in backend logic

module.exports = mongoose.model('Event', EventSchema);