const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner']
  },
  tags: [String],  // e.g. 'tasty', 'hygienic', 'value for money'
  isAnonymous: {
    type: Boolean,
    default: false
  },
  ownerReply: {
    text: String,
    repliedAt: Date
  }
}, { timestamps: true });

// One feedback per user per mess per day
feedbackSchema.index({ user: 1, mess: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
