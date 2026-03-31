const express = require('express');
const router = express.Router();
const {
  createMenu, getMenus, getTodayMenus, getMenu,
  updateMenu, deleteMenu, getMyMenus
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/today', getTodayMenus);
router.get('/my-menus', protect, authorize('owner'), getMyMenus);
router.get('/', getMenus);
router.post('/', protect, authorize('owner'), createMenu);
router.get('/:id', getMenu);
router.put('/:id', protect, authorize('owner', 'admin'), updateMenu);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteMenu);

module.exports = router;
