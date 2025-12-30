const CreateError = require('http-errors')
const Review = require('../models/review.model')
const logger = require('../utils/logger')
const APIFeatures = require('../utils/apiFeatures')
const { roles } = require('../types/user.enum')
const Product = require('../models/product.model')

exports.addReviewService = async (req) => {
  logger.info(`POST /app/v1/reviews endpoint called`, {
    lang: req.getLocale(),
    user: req.user.id,
    productId: req.body.productId
  })

  const { productId, description, rateNum } = req.body

  await Review.create({
    userId: req.user.id,
    productId,
    description,
    rateNum
  })
  const product = await Product.findById(productId).populate({
    path: 'productReview',
    options: { limit: 10 }
  })

  const reviewSummary = await product.getReviewSummary()

  return {
    status: 'success',
    message: req.__('review.added_successfully'),
    data: { ...product.toObject(), reviewSummary }
  }
}

exports.getReviewsService = async (req) => {
  logger.info(`GET /app/v1/review/${req.params.productId} endpoint called`, {
    lang: req.getLocale()
  })

  const reviews = await Review.find({
    productId: req.params.productId
  }).populate('userId', 'firstName lastName email')

  return {
    status: 'success',
    message: req.__('review.reviews_retrieved_successfully'),
    results: reviews.length,
    data: { reviews }
  }
}

exports.getAllReviewsService = async (req) => {
  logger.info(`GET /app/v1/review endpoint called`, {
    lang: req.getLocale()
  })

  const reviews = await Review.find()

  return {
    status: 'success',
    message: req.__('review.reviews_retrieved_successfully'),
    results: reviews.length,
    data: { reviews }
  }
}

exports.deleteReviewService = async (req) => {
  logger.info(`DELETE /app/v1/review/${req.params.reviewId} endpoint called`, {
    lang: req.getLocale(),
    userId: req.user.id
  })

  const review = await Review.findOneAndDelete({
    _id: req.params.reviewId,
    userId: req.user.id
  })

  if (!review) {
    throw CreateError(404, req.__('review.not_found'))
  }

  return {
    status: 'success',
    message: req.__('review.deleted_successfully')
  }
}

exports.deleteReviewOperationService = async (req) => {
  logger.info(
    `DELETE /app/v1/review/operation${req.params.reviewId} endpoint called`,
    {
      lang: req.getLocale(),
      operationId: req.user.id
    }
  )
  const review = await Review.findOneAndDelete({ _id: req.params.reviewId })

  if (!review) {
    throw CreateError(404, req.__('review.not_found'))
  }

  return {
    status: 'success',
    message: req.__('review.deleted_successfully')
  }
}

exports.updateReviewService = async (req) => {
  logger.info(`PUT /app/v1/review/${req.params.productId} endpoint called`, {
    lang: req.getLocale(),
    user: req.user.id
  })

  const { description, rateNum } = req.body

  const review = await Review.findOneAndUpdate(
    { userId: req.user.id, productId: req.params.productId },
    { description, rateNum },
    { new: true }
  )

  if (!review) {
    throw CreateError(404, req.__('review.not_found'))
  }

  return {
    status: 'success',
    message: req.__('review.updated_successfully'),
    data: { review }
  }
}
exports.updateReviewReplyService = async (req) => {
  logger.info(
    `PUT /app/v1/review/reply/${req.params.reviewId} endpoint called`,
    {
      lang: req.getLocale(),
      operationId: req.user.id
    }
  )

  const { reply } = req.body

  const review = await Review.findOneAndUpdate(
    { _id: req.params.reviewId },
    { reply },
    { new: true }
  )

  if (!review) {
    throw CreateError(404, req.__('review.not_found'))
  }

  return {
    status: 'success',
    message: req.__('review.reply_updated_successfully'),
    data: { review }
  }
}
