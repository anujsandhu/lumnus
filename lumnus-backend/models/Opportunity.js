const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'rejected', 'hired'],
      default: 'applied',
    },
    // Contact details submitted at apply time
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    // Resume stored as base64 (optional)
    resumeName: { type: String, trim: true },
    resumeData: { type: String }, // base64 encoded file content
    resumeMime: { type: String }, // e.g. application/pdf
  },
  { _id: false }
);

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['job', 'internship'],
      default: 'job',
    },
    location: { type: String, trim: true },
    description: { type: String, required: true },
    applyLink: { type: String, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [applicantSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
