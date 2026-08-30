const User = require('../models/User');

// @route  GET /api/users
// @desc   Directory — list all registered users with optional filters
const getUsers = async (req, res) => {
  try {
    const { batch, branch, company, skills, role, search } = req.query;

    // Show everyone who signed up (excluding admins and deactivated users)
    const filter = { role: { $ne: 'admin' }, isActive: { $ne: false } };

    if (role) filter.role = role;
    if (batch) filter.batch = new RegExp(batch, 'i');
    if (branch) filter.branch = new RegExp(branch, 'i');
    if (company) filter.company = new RegExp(company, 'i');
    if (skills) {
      filter.skills = {
        $in: skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
        { designation: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @route  GET /api/users/mentors
// @desc   List all users who opted in as mentors
const getMentors = async (req, res) => {
  try {
    const { expertise } = req.query;

    // Only require mentor flag + company + designation (enough to show in exploration cards)
    const queryConditions = [
      { isMentor: true },
      { company: { $exists: true, $ne: '' } },
      { designation: { $exists: true, $ne: '' } },
      { isActive: { $ne: false } },
    ];

    if (expertise) {
      queryConditions.push({
        mentorExpertise: { $in: [new RegExp(expertise, 'i')] }
      });
    }

    const filter = { $and: queryConditions };
    // Return only public-facing fields for mentor cards
    const mentors = await User.find(filter).select('name company designation mentorExpertise avatarUrl location');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/users/me
// @desc   Update logged-in user's own profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'batch', 'branch', 'company', 'designation',
      'location', 'bio', 'skills', 'avatarUrl', 'resumeUrl', 'resumeName', 'linkedinUrl', 'githubUrl',
      'isMentor', 'mentorExpertise', 'phone', 'isActive',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/users/me
// @desc   Delete user's own profile and all associated data
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const Connection = require('../models/Connection');
    const Mentorship = require('../models/Mentorship');
    const Opportunity = require('../models/Opportunity');
    const Event = require('../models/Event');

    // 1. Delete connection requests
    await Connection.deleteMany({
      $or: [{ fromUser: userId }, { toUser: userId }]
    });

    // 2. Delete mentorship sessions
    await Mentorship.deleteMany({
      $or: [{ mentor: userId }, { mentee: userId }]
    });

    // 3. Delete posted opportunities and applications
    await Opportunity.deleteMany({ postedBy: userId });
    await Opportunity.updateMany(
      {},
      { $pull: { applicants: { user: userId } } }
    );

    // 4. Delete organized events and RSVPs
    await Event.deleteMany({ organizer: userId });
    await Event.updateMany(
      {},
      { $pull: { rsvps: { user: userId } } }
    );

    // 5. Delete user profile
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers, getMentors, getUserById, updateProfile, deleteProfile };
