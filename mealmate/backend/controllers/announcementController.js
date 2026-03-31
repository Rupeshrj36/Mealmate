const Announcement = require('../models/Announcement');
const Mess = require('../models/Mess');

const createAnnouncement = async (req, res) => {
  try {
    const mess = await Mess.findOne({ owner: req.user._id });
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });

    const announcement = await Announcement.create({
      ...req.body,
      mess: mess._id,
      owner: req.user._id
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      mess: req.params.messId,
      isActive: true,
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }]
    }).sort('-createdAt').limit(10);

    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Not found' });
    if (ann.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await ann.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAnnouncement, getMessAnnouncements, deleteAnnouncement };
