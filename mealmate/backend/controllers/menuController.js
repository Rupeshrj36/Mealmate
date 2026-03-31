const Menu = require('../models/Menu');
const Mess = require('../models/Mess');
const User = require('../models/User');

// @desc   Create menu
// @route  POST /api/menus
// @access Owner
const createMenu = async (req, res) => {
  try {
    const mess = await Mess.findOne({ owner: req.user._id });
    if (!mess) return res.status(404).json({ success: false, message: 'Please create a mess profile first' });
    if (!mess.isApproved) return res.status(403).json({ success: false, message: 'Mess not yet approved' });

    const { date, mealType, items, image, price, isSpecial, specialNote } = req.body;

    // Check for existing menu
    const existing = await Menu.findOne({ mess: mess._id, date: new Date(date), mealType });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Menu already exists for this date and meal type. Update it instead.' });
    }

    const menu = await Menu.create({
      mess: mess._id,
      date: new Date(date),
      mealType,
      items,
      image,
      price,
      isSpecial,
      specialNote
    });

    // Notify subscribers
    const subscribers = await User.find({ subscriptions: mess._id });
    const notifMsg = `New ${mealType} menu posted by ${mess.name} for ${new Date(date).toDateString()}`;
    await User.updateMany(
      { _id: { $in: subscribers.map(s => s._id) } },
      { $push: { notifications: { message: notifMsg } } }
    );

    await menu.populate('mess', 'name');
    res.status(201).json({ success: true, menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get menus (by mess, date, mealType)
// @route  GET /api/menus
// @access Public
const getMenus = async (req, res) => {
  try {
    const { messId, date, mealType, startDate, endDate, week } = req.query;
    const query = { isPublished: true };

    if (messId) query.mess = messId;
    if (mealType) query.mealType = mealType;

    if (week === 'true' && date) {
      const d = new Date(date);
      const dayOfWeek = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      query.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }

    const menus = await Menu.find(query)
      .populate('mess', 'name location rating isVeg coverImage')
      .sort({ date: 1, mealType: 1 });

    res.json({ success: true, menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get today's menus for home page
// @route  GET /api/menus/today
// @access Public
const getTodayMenus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow },
      isPublished: true
    }).populate('mess', 'name location rating isVeg coverImage images');

    // Group by mess
    const grouped = {};
    menus.forEach(menu => {
      const messId = menu.mess._id.toString();
      if (!grouped[messId]) {
        grouped[messId] = { mess: menu.mess, meals: {} };
      }
      grouped[messId].meals[menu.mealType] = menu;
    });

    res.json({ success: true, menus, grouped: Object.values(grouped) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single menu
// @route  GET /api/menus/:id
// @access Public
const getMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate('mess', 'name location rating');
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update menu
// @route  PUT /api/menus/:id
// @access Owner
const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate('mess');
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

    if (menu.mess.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, menu: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete menu
// @route  DELETE /api/menus/:id
// @access Owner/Admin
const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate('mess');
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

    if (req.user.role !== 'admin' && menu.mess.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await menu.deleteOne();
    res.json({ success: true, message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get owner's menus
// @route  GET /api/menus/my-menus
// @access Owner
const getMyMenus = async (req, res) => {
  try {
    const mess = await Mess.findOne({ owner: req.user._id });
    if (!mess) return res.status(404).json({ success: false, message: 'No mess profile found' });

    const { startDate, endDate } = req.query;
    const query = { mess: mess._id };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const menus = await Menu.find(query).sort({ date: 1, mealType: 1 });
    res.json({ success: true, menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createMenu, getMenus, getTodayMenus, getMenu, updateMenu, deleteMenu, getMyMenus };
