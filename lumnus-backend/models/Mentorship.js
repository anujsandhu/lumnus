const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expertiseArea: { type: String, required: true, trim: true },
    message: { type: String, trim: true }, // mentee's request message
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'declined'],
      default: 'pending',
    },
    meetingLink: { type: String, trim: true, default: '' },
    sessionsLog: [sessionLogSchema],
    releaseRequest: {
      type: String,
      enum: ['none', 'pending', 'accepted'],
      default: 'none',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mentorship', mentorshipSchema);

