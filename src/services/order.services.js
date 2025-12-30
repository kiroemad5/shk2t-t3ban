const CreateError = require('http-errors')
const Order = require('../models/order.model')
const Cart = require('../models/cart.model')
const Payment = require('../models/payment.model')
const logger = require('../utils/logger')
const { default: mongoose } = require('mongoose')
const { paymentStatus } = require('../types/payment.enum')
const { roles } = require('../types/user.enum')
const { notificationType } = require('../types/notification.enum')
const { createNotificationWithSession } = require('./notification.services')
const { orderStatus } = require('../types/order.enum')
const APIFeatures = require('../utils/apiFeatures')

exports.createOrderService = async (req, res) => {
  const userId = req.user.id
  const cart = await Cart.findOne({ userId }).populate({
    path: 'items',
    populate: { path: 'productId' }
  })
  if (!cart || cart.totalQty === 0) {
    throw CreateError(400, req.__('cart.empty_or_not_found'))
  }

  if (req.files && req.files.length > 1) {
    throw CreateError(400, req.__('payment.only_one_image_allowed'))
  }

  let image = ''
  if (req.file) {
    image = req.file.path
    // console.log('Uploaded image path:', image)
  }
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const [order] = await Order.create(
      [
        {
          cartId: cart._id,
          userId,
          address: { ...req.body }
        }
      ],
      { session }
    )
    cart.isBecomeOrder = true
    await cart.save({ session })
    logger.info(`order: ${order}`)
    order._doc.cartId = cart

    //update stock quantity
    for (const item of cart.items) {
      const product = item.productId
      if (product.stockQty < item.itemQty) {
        throw CreateError(
          400,
          req.__('order.insufficient_stock_for_product', {
            productName: product.name
          })
        )
      }
      product.stockQty -= item.itemQty
      await product.save({ session })
    }

    const [paymentDetails] = await Payment.create(
      [
        {
          userId,
          orderId: order.orderId,
          ...req.body,
          totalPrice: cart.totalPrice,
          image
        }
      ],
      { session }
    )

    const notificationData1 = {
      title: `hi there`,
      message: `you have new order to review`,
      userType: roles.Operation,
      type: notificationType.Info
    }
    await createNotificationWithSession(notificationData1, session)

    const notificationData2 = {
      userID: order.userId,
      title: `Order created successfully`,
      message: `Order created successfully`,
      userType: roles.User,
      type: notificationType.Success
    }
    await createNotificationWithSession(notificationData2, session)

    await session.commitTransaction()
    return {
      status: 'success',
      message: req.__('order.created_successfully'),
      data: {
        ...order._doc
      }
    }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}

exports.getAllOrdersService = async (req, res) => {
  // const orders = await Order.find()
  const totalOrders = await Order.countDocuments()
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
  const orders = await features.query
    .populate({
      path: 'cartId',
      options: { isPopulateFromOrder: true },
      populate: [{ path: 'items', populate: { path: 'productId' } }]
    })
    .sort({ createdAt: -1 })

  return {
    status: 'success',
    totalOrders,
    results: orders.length,
    data: orders
  }
}

exports.getUserOrdersService = async (req, res) => {
  const userId = req.user._id
  const orders = await Order.find({ userId })
    .populate({
      path: 'cartId',
      options: { isPopulateFromOrder: true },
      populate: [{ path: 'items', populate: { path: 'productId' } }]
    })
    .sort({ createdAt: -1 })

  return {
    status: 'success',
    results: orders.length,
    data: orders
  }
}

exports.getOrderByIdService = async (req, res) => {
  const { orderId } = req.params

  const order = await Order.findOne({
    orderId
  })
    .populate({
      path: 'cartId',
      options: { isPopulateFromOrder: true },
      populate: [{ path: 'items', populate: { path: 'productId' } }]
    })
  if (!order) {
    throw CreateError(404, req.__('order.not_found'))
  }

  return {
    status: 'success',
    data: order
  }
}

exports.updateOrderStatusService = async (req, res) => {
  const { orderId } = req.params
  const { status } = req.body
  let order = null
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const payment = await Payment.findOne({ orderId })
    if (!payment) {
      throw CreateError(404, req.__('order.not_found'))
    }
    const operationIds = payment.operationIds
    if (!operationIds.includes(req.user.operationId)) {
      operationIds.push(req.user.operationId)
      payment.operationIds = operationIds
    }
    if (status == paymentStatus.Cancelled) {
      payment.paymentStatus = paymentStatus.Cancelled
    }
    if (status == orderStatus.Delivered) {
      payment.paymentStatus = paymentStatus.Paid
    }
    await payment.save({ session })

    if (status) {
      order = await Order.findOneAndUpdate({ orderId }, { status }, {
        new: true,
        session
      })
        .populate({
          path: 'cartId',
          options: { isPopulateFromOrder: true },
          populate: [{ path: 'items', populate: { path: 'productId' } }]
        })

      if (!order) {
        throw CreateError(404, req.__('order.not_found'))
      }
    }

    // update stock if cancelled
    if (status === paymentStatus.Cancelled) {
      const cart = order.cartId
      for (const item of cart.items) {
        const product = item.productId
        product.stockQty += item.itemQty
        await product.save({ session })
      }
    }
    const notificationData = {
      userID: order.userId,
      title: `Order status updated to ${status}`,
      message: `Order status updated to ${status} successfully`,
      userType: roles.User,
      type: notificationType.Info
    }
    await createNotificationWithSession(notificationData, session)

    await session.commitTransaction()
    return {
      status: 'success',
      message: req.__('order.status_updated'),
      data: order
    }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}
