const Connection = require('../models/Connection');

// @route  POST /api/connections
// @desc   Send a connection request
const sendRequest = async (req, res) => {
  try {
    const { toUser } = req.body;

    if (toUser === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { fromUser: req.user._id, toUser },
        { fromUser: toUser, toUser: req.user._id },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: 'Connection already exists', connection: existing });
    }

    const connection = await Connection.create({ fromUser: req.user._id, toUser });
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/connections/:id
// @desc   Accept or reject a connection request. Body: { status: 'accepted' | 'rejected' }
const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    if (String(connection.toUser) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the recipient can respond to this request' });
    }

    connection.status = status;
    await connection.save();
    res.json(connection);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/connections/:id (or POST /api/connections/withdraw/:id)
// @desc   Withdraw a pending connection request
const withdrawRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Connection request not found' });

    if (String(connection.fromUser) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the sender can withdraw this connection request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be withdrawn' });
    }

    await Connection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Connection request withdrawn successfully', _id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/connections/me
// @desc   List logged-in user's connections, optional ?status=
const getMyConnections = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
    };
    if (status) filter.status = status;

    const connections = await Connection.find(filter)
      .populate('fromUser', 'name role batch branch email avatarUrl linkedinUrl githubUrl designation company bio')
      .populate('toUser', 'name role batch branch email avatarUrl linkedinUrl githubUrl designation company bio');

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendRequest, respondToRequest, withdrawRequest, getMyConnections };
