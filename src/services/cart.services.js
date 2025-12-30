const CreateError = require('http-errors')
const Cart = require('../models/cart.model')
const CartItem = require('../models/cartItem.model')

exports.createCartService = async (req) => {
  const { userId } = req.body

  const existingCart = await Cart.findOne({ userId })
  if (existingCart) {
    throw CreateError(400, req.__('cart.already_exists'))
  }

  const cart = await Cart.create({ userId })
  return {
    status: 'success',
    message: req.__('cart.created_successfully'),
    data: cart
  }
}

exports.getCartService = async (req) => {
  const userId = req.user._id

  const cart = await Cart.findOne({ userId }).populate({
    path: 'items',
    populate: { path: 'productId', limit: 'name price imageList' }
  })
  if (!cart) {
    throw CreateError(404, req.__('cart.not_found'))
  }

  // const items = await CartItem.find({ cartId: cart._id }).populate(
  //   'productId',
  //   'name price imageList'
  // )

  return {
    status: 'success',
    data: {
      cart
      // items
    }
  }
}

exports.clearCartService = async (req) => {
  const userId = req.user._id

  const cart = await Cart.findOne({ userId })
  if (!cart) {
    throw CreateError(404, req.__('cart.not_found'))
  }

  await CartItem.deleteMany({ cartId: cart._id })

  cart.totalQty = 0
  cart.totalPrice = 0
  await cart.save()

  return {
    status: 'success',
    message: req.__('cart.cleared_successfully')
  }
}
