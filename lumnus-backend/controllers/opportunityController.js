const Opportunity = require('../models/Opportunity');

// @route  POST /api/opportunities
const createOpportunity = async (req, res) => {
  try {
    const { title, company, type, location, description, applyLink } = req.body;

    const opportunity = await Opportunity.create({
      title,
      company,
      type,
      location,
      description,
      applyLink,
      postedBy: req.user._id,
    });

    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/opportunities
const getOpportunities = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
      ];
    }

    // Return applicants WITHOUT resumeData to keep list responses lean
    const opportunities = await Opportunity.find(filter)
      .populate('postedBy', 'name company _id')
      .select('-applicants.resumeData')
      .sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/opportunities/:id/apply
// Body: { email, phone, resumeName?, resumeData?, resumeMime? }
const applyToOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    const alreadyApplied = opportunity.applicants.some(
      (a) => String(a.user) === String(req.user._id)
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this opportunity' });
    }

    const { email, phone, resumeName, resumeData, resumeMime } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required to apply' });
    }

    opportunity.applicants.push({
      user: req.user._id,
      email: email.trim(),
      phone: phone?.trim() || '',
      resumeName: resumeName || '',
      resumeData: resumeData || '',
      resumeMime: resumeMime || '',
    });

    await opportunity.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/opportunities/:id/applicants
// @desc   Only the poster can fetch full applicant list (with resume data)
const getApplicants = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('applicants.user', 'name email batch branch avatarUrl');

    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    if (String(opportunity.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the poster can view applicants' });
    }

    res.json(opportunity.applicants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/opportunities/:id/applicants/:userId
const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    if (String(opportunity.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the poster can update applicant status' });
    }

    const applicant = opportunity.applicants.find(
      (a) => String(a.user) === req.params.userId
    );
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = status;
    await opportunity.save();
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/opportunities/:id
const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    if (String(opportunity.postedBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this opportunity' });
    }

    await opportunity.deleteOne();
    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  applyToOpportunity,
  getApplicants,
  updateApplicantStatus,
  deleteOpportunity,
};
