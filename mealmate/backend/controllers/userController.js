const User = require('../models/User');
const Mess = require('../models/Mess');
const Menu = require('../models/Menu');
const Feedback = require('../models/Feedback');

// @desc   Get all users (admin)
// @route  GET /api/users
// @access Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Approve/reject mess owner
// @route  PUT /api/users/:id/approve
// @access Admin
const approveOwner = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'owner') {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    user.isApproved = isApproved;
    await user.save();

    // Add notification to user
    user.notifications.push({
      message: isApproved
        ? 'Your mess owner account has been approved! You can now create your mess profile.'
        : 'Your mess owner account application was not approved. Contact admin for details.'
    });
    await user.save();

    res.json({ success: true, message: `Owner ${isApproved ? 'approved' : 'rejected'} successfully`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Toggle user active status
// @route  PUT /api/users/:id/toggle-status
// @access Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get analytics for admin dashboard
// @route  GET /api/users/analytics
// @access Admin
const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalOwners, totalStudents, pendingApprovals, totalMesses, totalMenus, totalFeedback] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'owner', isApproved: false }),
      Mess.countDocuments({ isApproved: true }),
      Menu.countDocuments(),
      Feedback.countDocuments()
    ]);

    // Users registered per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top rated messes
    const topMesses = await Mess.find({ isApproved: true })
      .sort({ 'rating.average': -1 })
      .limit(5)
      .select('name rating location');

    res.json({
      success: true,
      analytics: {
        totalUsers, totalOwners, totalStudents, pendingApprovals,
        totalMesses, totalMenus, totalFeedback,
        userGrowth, topMesses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, approveOwner, toggleUserStatus, getAnalytics };
