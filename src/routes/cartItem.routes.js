const express = require('express')
const router = express.Router()

const {
  addCartItemController,
  getCartItemsController,
  updateCartItemController,
  deleteCartItemController
} = require('../controllers/cartItem.controller')

const {
  addCartItemSchema,
  updateCartItemSchema
} = require('../schemas/cartItem.schema')

const validateBodyMiddleware = require('../middlewares/validateBody.middleware')
const { protect } = require('../middlewares/protect.middleware')
const { restrictTo } = require('../middlewares/restrictTo.middleware')


router.post(
  '/',
  protect,
  restrictTo('user'),
  validateBodyMiddleware(addCartItemSchema),
  addCartItemController
)


// router.get('/:cartId', protect, restrictTo('user'), getCartItemsController)


router.put(
  '/:cartItemId',
  protect,
  restrictTo('user'),
  validateBodyMiddleware(updateCartItemSchema),
  updateCartItemController
)


router.delete(
  '/:cartItemId',
  protect,
  restrictTo('user'),
  deleteCartItemController
)

module.exports = router
