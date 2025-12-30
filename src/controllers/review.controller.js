// controllers/review.controller.js
const {
  addReviewService,
  getReviewsService,
  deleteReviewService,
  updateReviewService,
  getAllReviewsService,
  updateReviewReplyService,
  deleteReviewOperationService
} = require('../services/review.services')
const CreateError = require('http-errors')

exports.addReview = async (req, res, next) => {
  try {
    const result = await addReviewService(req)
    res.status(201).json(result)
  } catch (error) {
    if ((error && error.code === 11000) || error?.message?.includes('E11000')) {
      next(CreateError(409, req.__('review.you_already_reviewed')))
    }
    next(error)
  }
}

exports.getReviews = async (req, res, next) => {
  try {
    const result = await getReviewsService(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
exports.getAllReviews = async (req, res, next) => {
  try {
    const result = await getAllReviewsService(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

exports.deleteReview = async (req, res, next) => {
  try {
    const result = await deleteReviewService(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
exports.deleteReviewOperation = async (req, res, next) => {
  try {
    const result = await deleteReviewOperationService(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
exports.updateReview = async (req, res, next) => {
  try {
    const result = await updateReviewService(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

exports.updateReviewReply = async (req, res, next) => {
  try {
    const result = await updateReviewReplyService(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
