const express = require('express')
const router = express.Router()

const reviewController = require('../controllers/review.controller')
const { protect } = require('../middlewares/protect.middleware')
const { restrictTo } = require('../middlewares/restrictTo.middleware')
const validateBodyMiddleware = require('../middlewares/validateBody.middleware')
const { reviewSchema, reviewReplySchema } = require('../schemas/review.schemas')
const { roles } = require('../types/user.enum')

router.post(
  '/',
  protect,
  restrictTo('user', 'operation'),
  validateBodyMiddleware(reviewSchema),
  reviewController.addReview
)

router.get(
  '/',
  protect,
  restrictTo(roles.Operation),
  reviewController.getAllReviews
)

router.get('/:productId', reviewController.getReviews)

router.put(
  '/:productId',
  protect,
  validateBodyMiddleware(reviewSchema),
  reviewController.updateReview
)

router.delete(
  '/:reviewId',
  protect,
  restrictTo(roles.User),
  reviewController.deleteReview
)

router.delete(
  '/operation/:reviewId',
  protect,
  restrictTo(roles.Operation),
  reviewController.deleteReviewOperation
)

router.put(
  '/reply/:reviewId',
  protect,
  restrictTo(roles.Operation),
  validateBodyMiddleware(reviewReplySchema),
  reviewController.updateReviewReply
)

module.exports = router
