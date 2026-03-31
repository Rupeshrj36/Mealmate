const User = require('../models/User');
const Mess = require('../models/Mess');

// @desc   Subscribe to a mess
// @route  POST /api/subscriptions/:messId
// @access Student
const subscribe = async (req, res) => {
  try {
    const { messId } = req.params;
    const mess = await Mess.findById(messId);
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });

    const user = await User.findById(req.user._id);
    if (user.subscriptions.includes(messId)) {
      return res.status(400).json({ success: false, message: 'Already subscribed' });
    }

    user.subscriptions.push(messId);
    await user.save();
    await Mess.findByIdAndUpdate(messId, { $inc: { subscriberCount: 1 } });

    res.json({ success: true, message: `Subscribed to ${mess.name}!`, subscriptions: user.subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Unsubscribe from a mess
// @route  DELETE /api/subscriptions/:messId
// @access Student
const unsubscribe = async (req, res) => {
  try {
    const { messId } = req.params;
    const user = await User.findById(req.user._id);

    user.subscriptions = user.subscriptions.filter(id => id.toString() !== messId);
    await user.save();
    await Mess.findByIdAndUpdate(messId, { $inc: { subscriberCount: -1 } });

    res.json({ success: true, message: 'Unsubscribed successfully', subscriptions: user.subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get subscribed messes
// @route  GET /api/subscriptions
// @access Student
const getSubscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'subscriptions',
      select: 'name location rating isVeg coverImage mealTypes'
    });
    res.json({ success: true, subscriptions: user.subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { subscribe, unsubscribe, getSubscriptions };
