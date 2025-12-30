const express = require('express')
const router = express.Router()

const paymentController = require('../controllers/payment.controller')
const validateBodyMiddleware = require('../middlewares/validateBody.middleware')
const { protect } = require('../middlewares/protect.middleware')
const { restrictTo } = require('../middlewares/restrictTo.middleware')
const uploadMiddleware = require('../middlewares/uploadFiles.js')
const { roles } = require('../types/user.enum')

const {
  createPaymentSchema,
  updatePaymentStatusSchema
} = require('../schemas/payment.schema')

router.post(
  '/',
  protect,
  restrictTo(roles.Operation, roles.Admin),
  uploadMiddleware.single('image'),
  validateBodyMiddleware(createPaymentSchema),
  paymentController.createPaymentController
)

router.patch(
  '/:paymentId/status',
  protect,
  restrictTo(roles.Operation, roles.Admin),
  validateBodyMiddleware(updatePaymentStatusSchema),
  paymentController.updatePaymentStatusController
)

router.get(
  '/:orderId',
  protect,
  restrictTo(roles.Operation, roles.Admin),
  paymentController.getPaymentByOrderController
)

router.get(
  '/',
  protect,
  restrictTo(roles.Operation, roles.Admin),
  paymentController.getAllPaymentsController
)

router.get(
  '/admin/statistics/profits',
  protect,
  restrictTo(roles.Admin),
  paymentController.getProfitsStatisticsController
)

router.get(
  '/admin/statistics/',
  protect,
  restrictTo(roles.Operation, roles.Admin),
  paymentController.getStatisticsController
)

router.get(
  '/admin/statistics/operation/:operationId',
  protect,
  restrictTo(roles.Admin),
  paymentController.getOperationStatisticsController
)

module.exports = router
