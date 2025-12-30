const express = require('express')
const router = express.Router()
const {
  createWishItem,
  getWishItems,
  deleteWishItem
} = require('../controllers/wishItem.controller')

const { wishItemSchema } = require('../schemas/wishItem.schemas')
const validateBodyMiddleware = require('../middlewares/validateBody.middleware')
const { protect } = require('../middlewares/protect.middleware.js')
const { restrictTo } = require('../middlewares/restrictTo.middleware.js')

router.post(
  '/',
  protect,
  restrictTo('user'),
  validateBodyMiddleware(wishItemSchema),
  createWishItem
)
router.get('/', protect, restrictTo('user'), getWishItems)
router.delete('/:productId', protect, restrictTo('user'), deleteWishItem)

module.exports = router
