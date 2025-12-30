const {
  createOrderService,
  getUserOrdersService,
  getOrderByIdService,
  updateOrderStatusService,
  getAllOrdersService
} = require('../services/order.services')
const CreateError = require('http-errors')

exports.createOrderController = async (req, res, next) => {
  try {
    const result = await createOrderService(req)
    res.status(201).json(result)
  } catch (error) {
    if ((error && error.code === 11000) || error?.message?.includes('E11000')) {
      next(CreateError(409, req.__('order.already_exists')))
    }
    next(error)
  }
}

exports.getUserOrdersController = async (req, res, next) => {
  try {
    const result = await getUserOrdersService(req, res)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
exports.getAllOrdersController = async (req, res, next) => {
  try {
    const result = await getAllOrdersService(req, res)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
exports.getOrderByIdController = async (req, res, next) => {
  try {
    const result = await getOrderByIdService(req, res)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.updateOrderStatusController = async (req, res, next) => {
  try {
    const result = await updateOrderStatusService(req, res)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
