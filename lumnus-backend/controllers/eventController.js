const Event = require('../models/Event');

// @route  POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, eventType, date, location, meetingLink } = req.body;

    const event = await Event.create({
      title,
      description,
      eventType,
      date,
      location,
      meetingLink,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/events
// @desc   List upcoming events by default, optional ?past=true for history
const getEvents = async (req, res) => {
  try {
    const { past } = req.query;
    const filter = past === 'true' ? { date: { $lt: new Date() } } : { date: { $gte: new Date() } };

    const events = await Event.find(filter)
      .populate('organizer', 'name role')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name role')
      .populate('rsvps.user', 'name role avatarUrl');

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  POST /api/events/:id/rsvp
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const alreadyRsvpd = event.rsvps.some((r) => String(r.user) === String(req.user._id));
    if (alreadyRsvpd) {
      return res.status(400).json({ message: 'Already RSVP\'d to this event' });
    }

    event.rsvps.push({ user: req.user._id });
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/events/:id
// @desc   Only the organizer can delete their event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (String(event.organizer) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, rsvpEvent, deleteEvent };
