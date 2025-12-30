const {
  createPaymentService,
  getPaymentByOrderService,
  updatePaymentStatusService,
  getAllPaymentsService,
  getStatisticsService,
  getProfitsStatisticsService,
  getOperationStatisticsService
} = require('../services/payment.services')

exports.getAllPaymentsController = async (req, res, next) => {
  try {
    const result = await getAllPaymentsService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.createPaymentController = async (req, res, next) => {
  try {
    const result = await createPaymentService(req)
    res.status(201).json(result)
  } catch (error) {
    if (error.code === 11000) {
      next(new Error('payment.order_id_already_exists'))
    } else {
      next(error)
    }
  }
}

exports.getPaymentByOrderController = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const result = await getPaymentByOrderService(orderId, req)

    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.updatePaymentStatusController = async (req, res, next) => {
  try {
    const result = await updatePaymentStatusService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.getStatisticsController = async (req, res, next) => {
  try {
    const result = await getStatisticsService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.getProfitsStatisticsController = async (req, res, next) => {
  try {
    const result = await getProfitsStatisticsService()
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.getOperationStatisticsController = async (req, res, next) => {
  try {
    const result = await getOperationStatisticsService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
