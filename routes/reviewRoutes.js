const express = require('express');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourAndUserID,
  getAReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourAndUserID, createReview);

router
  .route('/:id')
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .get(getAReview);

module.exports = router;
