const express = require('express')
const router = express.Router()

const {
  getCartController,
  clearCartController
} = require('../controllers/cart.controller')


const { protect } = require('../middlewares/protect.middleware')
const { restrictTo } = require('../middlewares/restrictTo.middleware')


router.get('/', protect, restrictTo('user'), getCartController)


router.delete('/', protect, restrictTo('user'), clearCartController)

module.exports = router
