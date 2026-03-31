const express = require('express');
const router = express.Router();
const {
  createMess, getAllMesses, getMess, getMyMess,
  updateMess, approveMess, deleteMess, getAllMessesAdmin
} = require('../controllers/messController');
const { protect, authorize, requireApproval } = require('../middleware/auth');

router.get('/', getAllMesses);
router.get('/admin/all', protect, authorize('admin'), getAllMessesAdmin);
router.get('/my-mess', protect, authorize('owner'), getMyMess);
router.post('/', protect, authorize('owner'), requireApproval, createMess);
router.get('/:id', getMess);
router.put('/:id', protect, authorize('owner', 'admin'), updateMess);
router.put('/:id/approve', protect, authorize('admin'), approveMess);
router.delete('/:id', protect, authorize('admin'), deleteMess);

module.exports = router;
