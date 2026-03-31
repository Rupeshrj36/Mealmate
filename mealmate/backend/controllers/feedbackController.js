const Feedback = require('../models/Feedback');
const Mess = require('../models/Mess');

// @desc   Add feedback
// @route  POST /api/feedback
// @access Student
const addFeedback = async (req, res) => {
  try {
    const { messId, rating, comment, mealType, tags, isAnonymous, menuId } = req.body;

    const mess = await Mess.findById(messId);
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });

    const feedback = await Feedback.create({
      user: req.user._id,
      mess: messId,
      menu: menuId,
      rating,
      comment,
      mealType,
      tags,
      isAnonymous
    });

    // Recalculate mess rating
    const allFeedback = await Feedback.find({ mess: messId });
    const avg = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    await Mess.findByIdAndUpdate(messId, {
      'rating.average': Math.round(avg * 10) / 10,
      'rating.count': allFeedback.length
    });

    await feedback.populate('user', 'name avatar');
    res.status(201).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get feedback for a mess
// @route  GET /api/feedback/mess/:messId
// @access Public
const getMessFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, mealType } = req.query;
    const query = { mess: req.params.messId };
    if (mealType) query.mealType = mealType;

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    // Anonymize if needed
    const sanitized = feedbacks.map(f => {
      if (f.isAnonymous) {
        return { ...f.toObject(), user: { name: 'Anonymous Student', avatar: null } };
      }
      return f;
    });

    res.json({ success: true, feedbacks: sanitized, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Owner reply to feedback
// @route  PUT /api/feedback/:id/reply
// @access Owner
const replyToFeedback = async (req, res) => {
  try {
    const { text } = req.body;
    const feedback = await Feedback.findById(req.params.id).populate('mess');

    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    if (feedback.mess.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    feedback.ownerReply = { text, repliedAt: new Date() };
    await feedback.save();

    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete feedback
// @route  DELETE /api/feedback/:id
// @access Admin/Owner of feedback
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

    if (req.user.role !== 'admin' && feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await feedback.deleteOne();
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all feedback (admin)
// @route  GET /api/feedback
// @access Admin
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .populate('mess', 'name')
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addFeedback, getMessFeedback, replyToFeedback, deleteFeedback, getAllFeedback };
