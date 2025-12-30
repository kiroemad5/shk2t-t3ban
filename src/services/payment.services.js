const Payment = require('../models/payment.model')
const CreateError = require('http-errors')
const { paymentType, paymentStatus } = require('../types/payment.enum')
const APIFeatures = require('../utils/apiFeatures')
const { roles } = require('../types/user.enum')
const { calculateTotalCountAndAmount } = require('../utils/statisticsHelper')
const logger = require('../utils/logger')
const User = require('../models/user.model')
const { v4 } = require('uuid')

exports.createPaymentService = async (req) => {
  const orderId =
    req.body?.orderId || v4().replace(/-/g, '').substring(0, 16).toUpperCase()

  if (req.files && req.files.length > 1) {
    throw CreateError(400, req.__('payment.only_one_image_allowed'))
  }

  if (req.file) {
    req.body.image = req.file.path
    // console.log('Uploaded image path:', req.file.path)
  }

  const payment = await Payment.create({
    userId: req.user,
    orderId,
    ...req.body
  })

  return {
    status: 'success',
    message: req.__('payment.created_successfully'),
    data: payment
  }
}

exports.getPaymentByOrderService = async (orderId, req) => {
  const payment = await Payment.findOne({ orderId }).populate(
    'userId',
    'firstName lastName email'
  )

  if (!payment) {
    throw CreateError(
      404,
      req ? req.__('payment.not_found') : 'Payment not found'
    )
  }

  return {
    status: 'success',
    data: payment
  }
}

exports.updatePaymentStatusService = async (req) => {
  const { paymentId } = req.params
  const { paymentStatus } = req.body

  const payment = await Payment.findById(paymentId).populate(
    'userId',
    'firstName lastName email'
  )

  if (!payment) {
    throw CreateError(404, req.__('payment.not_found'))
  }

  payment.paymentStatus = paymentStatus
  await payment.save()

  return {
    status: 'success',
    message: req.__('payment.status_updated_successfully'),
    data: payment
  }
}

exports.getAllPaymentsService = async (req) => {
  if (req.user.role === roles.Operation) {
    req.query.type = paymentType.Revenues
  }

  const features = new APIFeatures(Payment.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
  const payments = await features.query.populate(
    'userId',
    'firstName lastName email'
  )
  const total = await Payment.countDocuments()
  return {
    status: 'success',
    message: req.__('payment.payments_retrieved_successfully'),
    results: total,
    data: payments
  }
}

exports.getStatisticsService = async (req) => {
  // Get all paid revenues
  const Statistics = await calculateTotalCountAndAmount(
    req.query.type || paymentType.Revenues
  )

  // Monthly revenue aggregation
  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        type: req.query.type || paymentType.Revenues,
        paymentStatus: paymentStatus.Paid
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalAmount: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        monthName: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id.month', 1] }, then: 'يناير' },
              { case: { $eq: ['$_id.month', 2] }, then: 'فبراير' },
              { case: { $eq: ['$_id.month', 3] }, then: 'مارس' },
              { case: { $eq: ['$_id.month', 4] }, then: 'أبريل' },
              { case: { $eq: ['$_id.month', 5] }, then: 'مايو' },
              { case: { $eq: ['$_id.month', 6] }, then: 'يونيو' },
              { case: { $eq: ['$_id.month', 7] }, then: 'يوليو' },
              { case: { $eq: ['$_id.month', 8] }, then: 'أغسطس' },
              { case: { $eq: ['$_id.month', 9] }, then: 'سبتمبر' },
              { case: { $eq: ['$_id.month', 10] }, then: 'أكتوبر' },
              { case: { $eq: ['$_id.month', 11] }, then: 'نوفمبر' },
              { case: { $eq: ['$_id.month', 12] }, then: 'ديسمبر' }
            ],
            default: 'غير محدد'
          }
        },
        totalAmount: 1,
        count: 1
      }
    }
  ])

  return {
    status: 'success',
    message: req.__('payment.statistics_retrieved_successfully'),
    data: {
      Statistics,
      monthlyRevenue
    }
  }
}

exports.getProfitsStatisticsService = async () => {
  const Revenues = await calculateTotalCountAndAmount(paymentType.Revenues)
  const Expenses = await calculateTotalCountAndAmount(paymentType.Expenses)

  const totalProfit = Revenues.totalAmount - Expenses.totalAmount

  // Monthly profit aggregation
  const monthlyStatistics = await Payment.aggregate([
    {
      $match: {
        paymentStatus: paymentStatus.Paid
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type'
        },
        totalAmount: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month'
        },
        revenues: {
          $sum: {
            $cond: [
              { $eq: ['$_id.type', paymentType.Revenues] },
              '$totalAmount',
              0
            ]
          }
        },
        expenses: {
          $sum: {
            $cond: [
              { $eq: ['$_id.type', paymentType.Expenses] },
              '$totalAmount',
              0
            ]
          }
        },
        revenueCount: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', paymentType.Revenues] }, '$count', 0]
          }
        },
        expenseCount: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', paymentType.Expenses] }, '$count', 0]
          }
        }
      }
    },
    {
      $addFields: {
        profit: { $subtract: ['$revenues', '$expenses'] }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        monthName: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id.month', 1] }, then: 'يناير' },
              { case: { $eq: ['$_id.month', 2] }, then: 'فبراير' },
              { case: { $eq: ['$_id.month', 3] }, then: 'مارس' },
              { case: { $eq: ['$_id.month', 4] }, then: 'أبريل' },
              { case: { $eq: ['$_id.month', 5] }, then: 'مايو' },
              { case: { $eq: ['$_id.month', 6] }, then: 'يونيو' },
              { case: { $eq: ['$_id.month', 7] }, then: 'يوليو' },
              { case: { $eq: ['$_id.month', 8] }, then: 'أغسطس' },
              { case: { $eq: ['$_id.month', 9] }, then: 'سبتمبر' },
              { case: { $eq: ['$_id.month', 10] }, then: 'أكتوبر' },
              { case: { $eq: ['$_id.month', 11] }, then: 'نوفمبر' },
              { case: { $eq: ['$_id.month', 12] }, then: 'ديسمبر' }
            ],
            default: 'غير محدد'
          }
        },
        revenues: 1,
        expenses: 1,
        profit: 1,
        revenueCount: 1,
        expenseCount: 1
      }
    }
  ])

  // Yearly profit aggregation
  const yearlyStatistics = await Payment.aggregate([
    {
      $match: {
        paymentStatus: paymentStatus.Paid
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          type: '$type'
        },
        totalAmount: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year'
        },
        revenues: {
          $sum: {
            $cond: [
              { $eq: ['$_id.type', paymentType.Revenues] },
              '$totalAmount',
              0
            ]
          }
        },
        expenses: {
          $sum: {
            $cond: [
              { $eq: ['$_id.type', paymentType.Expenses] },
              '$totalAmount',
              0
            ]
          }
        },
        revenueCount: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', paymentType.Revenues] }, '$count', 0]
          }
        },
        expenseCount: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', paymentType.Expenses] }, '$count', 0]
          }
        }
      }
    },
    {
      $addFields: {
        profit: { $subtract: ['$revenues', '$expenses'] }
      }
    },
    {
      $sort: { '_id.year': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        revenues: 1,
        expenses: 1,
        profit: 1,
        revenueCount: 1,
        expenseCount: 1
      }
    }
  ])
  const totalOperations = await User.countDocuments({ role: roles.Operation })

  return {
    status: 'success',
    data: {
      totalOperations,
      totalProfit,
      Expenses,
      Revenues,
      monthlyStatistics,
      yearlyStatistics
    }
  }
}

exports.getOperationStatisticsService = async (req) => {
  logger.info('get Operation Statistics', {
    lang: req.getLocale()
  })

  const Operations = await Payment.aggregate([
    {
      $match: {
        operationIds: { $in: [req.params.operationId] },
        paymentStatus: paymentStatus.Paid,
        type: paymentType.Revenues
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalAmount: { $sum: '$totalPrice' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        monthName: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id.month', 1] }, then: 'يناير' },
              { case: { $eq: ['$_id.month', 2] }, then: 'فبراير' },
              { case: { $eq: ['$_id.month', 3] }, then: 'مارس' },
              { case: { $eq: ['$_id.month', 4] }, then: 'أبريل' },
              { case: { $eq: ['$_id.month', 5] }, then: 'مايو' },
              { case: { $eq: ['$_id.month', 6] }, then: 'يونيو' },
              { case: { $eq: ['$_id.month', 7] }, then: 'يوليو' },
              { case: { $eq: ['$_id.month', 8] }, then: 'أغسطس' },
              { case: { $eq: ['$_id.month', 9] }, then: 'سبتمبر' },
              { case: { $eq: ['$_id.month', 10] }, then: 'أكتوبر' },
              { case: { $eq: ['$_id.month', 11] }, then: 'نوفمبر' },
              { case: { $eq: ['$_id.month', 12] }, then: 'ديسمبر' }
            ],
            default: 'غير محدد'
          }
        },
        totalAmount: 1,
        count: 1
      }
    }
  ])

  // حساب العدد الإجمالي للمستخدمين
  const totalOrders = await Payment.countDocuments({
    operationIds: { $in: [req.params.operationId] },
    paymentStatus: paymentStatus.Paid,
    type: paymentType.Revenues
  })

  const operationDetails = await User.find({
    operationId: req.params.operationId
  })
  return {
    status: 'success',
    message: req.__('user.operations_statistics_retrieved_successfully'),
    data: {
      totalOrders,
      operationDetails,
      Operations
    }
  }
}
