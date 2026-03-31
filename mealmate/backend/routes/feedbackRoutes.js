const express = require('express');
const router = express.Router();
const { addFeedback, getMessFeedback, replyToFeedback, deleteFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllFeedback);
router.post('/', protect, authorize('student'), addFeedback);
router.get('/mess/:messId', getMessFeedback);
router.put('/:id/reply', protect, authorize('owner'), replyToFeedback);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
