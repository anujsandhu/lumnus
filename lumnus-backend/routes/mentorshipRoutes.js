const express = require('express');
const {
  requestMentorship,
  updateMentorshipStatus,
  updateMeetingLink,
  withdrawMentorshipRequest,
  addSessionLog,
  getMyMentorships,
  requestRelease,
  acceptRelease,
} = require('../controllers/mentorshipController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, requestMentorship);
router.get('/me', protect, getMyMentorships);
router.put('/:id/status', protect, updateMentorshipStatus);
router.put('/:id/meeting', protect, updateMeetingLink);
router.delete('/:id', protect, withdrawMentorshipRequest);
router.post('/withdraw/:id', protect, withdrawMentorshipRequest);
router.post('/:id/sessions', protect, addSessionLog);
router.put('/:id/release', protect, requestRelease);
router.put('/:id/release/accept', protect, acceptRelease);

module.exports = router;
