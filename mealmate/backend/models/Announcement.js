const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['general', 'menu_change', 'holiday', 'special', 'maintenance'],
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
