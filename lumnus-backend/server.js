require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const eventRoutes = require('./routes/eventRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

connectDB();

const app = express();

// COOP header for Firebase Google popup auth compatibility
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Dynamic CORS — reflects any incoming origin (supports localhost:any-port + production)
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lumnus API is running' });
});

// Public stats — no auth required
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Event = require('./models/Event');

    const [totalUsers, totalMentors, events] = await Promise.all([
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isMentor: true, isActive: { $ne: false } }),
      Event.find({}, { rsvps: 1 }),
    ]);

    const totalRsvps = events.reduce((sum, e) => sum + (e.rsvps?.length || 0), 0);
    const totalEvents = events.length;

    res.json({ totalUsers, totalMentors, totalEvents, totalRsvps });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch stats', error: err.message });
  }
});

// Mounted routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start server with EADDRINUSE fallback
const PORT = parseInt(process.env.PORT, 10) || 5050;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.warn(`⚠️  Port ${PORT} is in use, trying port ${fallbackPort}...`);
    app.listen(fallbackPort, () => {
      console.log(`Server running on port ${fallbackPort}`);
    });
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
