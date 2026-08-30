const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['student', 'alumni', 'admin'],
      default: 'student',
    },
    batch: { type: String, trim: true }, // e.g. "2022"
    branch: { type: String, trim: true }, // e.g. "CSE"
    company: { type: String, trim: true }, // current employer, mainly for alumni
    designation: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String, trim: true }],
    avatarUrl: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    resumeName: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    phone: { type: String, trim: true, default: '' },
    isMentor: { type: Boolean, default: false }, // alumni opting in as mentors
    mentorExpertise: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
