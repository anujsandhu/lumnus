const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['reunion', 'webinar', 'workshop', 'networking', 'other'],
      default: 'other',
    },
    date: { type: Date, required: true },
    location: { type: String, trim: true }, // physical address or "Online"
    meetingLink: { type: String, trim: true }, // for online events
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rsvps: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
