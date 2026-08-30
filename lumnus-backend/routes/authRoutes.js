const express = require('express');
const { registerUser, loginUser, getMe, firebaseLogin, firebaseRegister } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase-login', firebaseLogin);
router.post('/firebase-register', firebaseRegister);
router.get('/me', protect, getMe);

module.exports = router;
