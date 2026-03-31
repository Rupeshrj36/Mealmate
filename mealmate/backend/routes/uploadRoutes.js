const express = require('express');
const router = express.Router();
const path = require('path');
const { upload, withType } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// @desc   Upload a single image
// @route  POST /api/upload/:type   (type = mess | menu | avatars)
// @access Private
router.post('/:type', protect, (req, res, next) => {
  req.uploadType = req.params.type;
  next();
}, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Return a URL the frontend can store in DB (relative to server)
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.params.type}/${req.file.filename}`;

  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename
  });
});

module.exports = router;
