const express = require('express');

const {
  createUser,
  deleteUser,
  getAllUsers,
  getAnUser,
  updateUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');

const router = express.Router(); // This is a middleware

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getAnUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getAnUser).patch(updateUser).delete(deleteUser);

module.exports = router;
