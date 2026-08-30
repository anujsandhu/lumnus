const express = require('express');
const {
  sendRequest,
  respondToRequest,
  withdrawRequest,
  getMyConnections,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, sendRequest);
router.put('/:id', protect, respondToRequest);
router.delete('/:id', protect, withdrawRequest);
router.post('/withdraw/:id', protect, withdrawRequest);
router.get('/me', protect, getMyConnections);

module.exports = router;
