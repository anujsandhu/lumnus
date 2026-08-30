const express = require('express');
const { getUsers, getMentors, getUserById, updateProfile, deleteProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/mentors', protect, getMentors);
router.put('/me', protect, updateProfile);
router.delete('/me', protect, deleteProfile);
router.get('/:id', protect, getUserById);

module.exports = router;
