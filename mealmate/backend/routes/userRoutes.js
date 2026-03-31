const express = require('express');
const router = express.Router();
const { getAllUsers, approveOwner, toggleUserStatus, getAnalytics } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/analytics', getAnalytics);
router.put('/:id/approve', approveOwner);
router.put('/:id/toggle-status', toggleUserStatus);

module.exports = router;
