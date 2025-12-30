const express = require('express')
const router = express.Router()
const {
  createOrderController,
  getUserOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  getAllOrdersController
} = require('../controllers/order.controller')

const { protect } = require('../middlewares/protect.middleware')
const { restrictTo } = require('../middlewares/restrictTo.middleware')
const validateBodyMiddleware = require('../middlewares/validateBody.middleware')
const {
  createOrderSchema,
  updateOrderStatusSchema
} = require('../schemas/order.schema')
const { roles } = require('../types/user.enum')
const uploadMiddleware = require('../middlewares/uploadFiles')

router.post(
  '/',
  protect,
  restrictTo('user'),
  uploadMiddleware.single('image'),
  validateBodyMiddleware(createOrderSchema),
  createOrderController
)

router.get('/', protect, restrictTo(roles.Operation), getAllOrdersController)
router.get(
  '/user/:orderId',
  protect,
  restrictTo(roles.Operation),
  getOrderByIdController
)
router.get('/user', protect, restrictTo('user'), getUserOrdersController)

router.patch(
  '/:orderId/status',
  protect,
  restrictTo('operation'),
  validateBodyMiddleware(updateOrderStatusSchema),
  updateOrderStatusController
)

module.exports = router
