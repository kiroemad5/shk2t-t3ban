const {
  createInquiryServices,
  getAllInquiriesServices,
  updateInquiryServices,
  addReplyToInquiryServices,
  acceptReplyServices,
  updateReplyToInquiryServices,
  deleteInquiryServices,
  deleteReplyFromInquiryServices,
  rejectAcceptedReplyServices,
  endInquiryServices
} = require('../services/inquiry.services')

const createInquiryController = async (req, res, next) => {
  try {
    const result = await createInquiryServices(req, res)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const getAllInquiriesController = async (req, res, next) => {
  try {
    const result = await getAllInquiriesServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

// const getInquiryByIdController = async (req, res, next) => {
//   try {
//     const result = await getInquiryByIdServices(req)
//     res.status(200).json(result)
//   } catch (error) {
//     next(error)
//   }
// }

const updateInquiryController = async (req, res, next) => {
  try {
    const result = await updateInquiryServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const addReplyToInquiryController = async (req, res, next) => {
  try {
    const result = await addReplyToInquiryServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const acceptReplyController = async (req, res, next) => {
  try {
    const result = await acceptReplyServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const updateReplyController = async (req, res, next) => {
  try {
    const result = await updateReplyToInquiryServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteInquiryController = async (req, res, next) => {
  try {
    const result = await deleteInquiryServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteReplyController = async (req, res, next) => {
  try {
    const result = await deleteReplyFromInquiryServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const rejectAcceptedReplyController = async (req, res, next) => {
  try {
    const result = await rejectAcceptedReplyServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const endInquiryController = async (req, res, next) => {
  try {
    const result = await endInquiryServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createInquiryController,
  getAllInquiriesController,
  updateInquiryController,
  addReplyToInquiryController,
  acceptReplyController,
  updateReplyController,
  deleteInquiryController,
  deleteReplyController,
  rejectAcceptedReplyController,
  endInquiryController
}
