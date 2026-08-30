const Mentorship = require('../models/Mentorship');
const User = require('../models/User');

// @route  POST /api/mentorships
// @desc   Mentee requests mentorship from a mentor
const requestMentorship = async (req, res) => {
  try {
    const { mentor, expertiseArea, message } = req.body;

    const mentorUser = await User.findById(mentor);
    if (!mentorUser || !mentorUser.isMentor) {
      return res.status(400).json({ message: 'Selected user is not a registered mentor' });
    }

    // Check if an active/pending mentorship already exists for this mentee
    const existing = await Mentorship.findOne({
      mentee: req.user._id,
      status: { $in: ['pending', 'active'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active or pending mentorship' });
    }

    const mentorship = await Mentorship.create({
      mentor,
      mentee: req.user._id,
      expertiseArea,
      message,
    });

    res.status(201).json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/mentorships/:id/status
// @desc   Mentor accepts/declines/completes a mentorship
const updateMentorshipStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) return res.status(404).json({ message: 'Mentorship not found' });

    if (String(mentorship.mentor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the mentor can update this mentorship' });
    }

    mentorship.status = status;
    if (meetingLink !== undefined) {
      mentorship.meetingLink = meetingLink;
    }
    await mentorship.save();
    res.json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/mentorships/:id/meeting
// @desc   Set or update meeting link for mentorship session (Google Meet, Zoom, Jitsi)
const updateMeetingLink = async (req, res) => {
  try {
    const { meetingLink } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return res.status(404).json({ message: 'Mentorship not found' });

    const isParticipant =
      String(mentorship.mentor) === String(req.user._id) ||
      String(mentorship.mentee) === String(req.user._id);

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to update meeting link' });
    }

    mentorship.meetingLink = meetingLink;
    await mentorship.save();
    res.json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/mentorships/:id (or POST /api/mentorships/withdraw/:id)
// @desc   Mentee withdraws a pending mentorship request
const withdrawMentorshipRequest = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return res.status(404).json({ message: 'Mentorship request not found' });

    if (String(mentorship.mentee) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the mentee can withdraw this mentorship request' });
    }

    if (mentorship.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be withdrawn' });
    }

    await Mentorship.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mentorship request withdrawn successfully', _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/mentorships/:id/sessions
// @desc   Log a mentorship session
const addSessionLog = async (req, res) => {
  try {
    const { date, notes } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) return res.status(404).json({ message: 'Mentorship not found' });

    const isParticipant =
      String(mentorship.mentor) === String(req.user._id) ||
      String(mentorship.mentee) === String(req.user._id);

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not part of this mentorship' });
    }

    mentorship.sessionsLog.push({ date, notes });
    await mentorship.save();
    res.json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/mentorships/me
// @desc   List mentorships where the user is mentor or mentee
const getMyMentorships = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {
      $or: [{ mentor: req.user._id }, { mentee: req.user._id }],
    };
    if (status) filter.status = status;

    const mentorships = await Mentorship.find(filter)
      .populate('mentor', 'name company designation email phone avatarUrl linkedinUrl')
      .populate('mentee', 'name batch branch email avatarUrl');

    res.json(mentorships);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/mentorships/:id/release
// @desc   Student requests to be released from their current mentorship
const requestRelease = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return res.status(404).json({ message: 'Mentorship not found' });

    if (String(mentorship.mentee) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the mentee can request a release' });
    }

    if (mentorship.status !== 'active') {
      return res.status(400).json({ message: 'Can only request release from an active mentorship' });
    }

    mentorship.releaseRequest = 'pending';
    await mentorship.save();
    res.json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/mentorships/:id/release/accept
// @desc   Mentor accepts the student's release request — student is freed
const acceptRelease = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) return res.status(404).json({ message: 'Mentorship not found' });

    if (String(mentorship.mentor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the mentor can accept a release' });
    }

    if (mentorship.releaseRequest !== 'pending') {
      return res.status(400).json({ message: 'No pending release request on this mentorship' });
    }

    mentorship.releaseRequest = 'accepted';
    mentorship.status = 'completed'; // Mark as completed — student is freed to find new mentor
    await mentorship.save();
    res.json(mentorship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  requestMentorship,
  updateMentorshipStatus,
  updateMeetingLink,
  withdrawMentorshipRequest,
  addSessionLog,
  getMyMentorships,
  requestRelease,
  acceptRelease,
};
