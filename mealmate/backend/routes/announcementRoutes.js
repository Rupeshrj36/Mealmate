const express = require('express');
const router = express.Router();
const { createAnnouncement, getMessAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/mess/:messId', getMessAnnouncements);
router.post('/', protect, authorize('owner'), createAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;
