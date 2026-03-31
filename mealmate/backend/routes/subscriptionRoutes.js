const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscriptions } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getSubscriptions);
router.post('/:messId', authorize('student'), subscribe);
router.delete('/:messId', authorize('student'), unsubscribe);

module.exports = router;
