const CreateError = require('http-errors')
const Cart = require('../models/cart.model')
const CartItem = require('../models/cartItem.model')
const Product = require('../models/product.model')

async function updateCartTotals(cartId) {
  const items = await CartItem.find({ cartId }).populate('productId')

  const totalQty = items.reduce((acc, item) => acc + item.itemQty, 0)
  const totalPrice = items.reduce(
    (acc, item) => acc + item.itemQty * (item.productId?.price || 0),
    0
  )

  await Cart.findByIdAndUpdate(cartId, { totalQty, totalPrice })
}

exports.addCartItemService = async (req) => {
  const { productId, itemQty } = req.body
  const userId = req.user._id

  let cart = await Cart.findOne({ userId })
  if (!cart) {
    cart = await Cart.create({ userId, totalQty: 0, totalPrice: 0 })
  }

  const product = await Product.findById(productId)
  if (!product) {
    throw CreateError(404, req.__('product.not_found'))
  }

  let cartItem = await CartItem.findOne({
    cartId: cart._id,
    productId
  }).populate('productId')

  if (cartItem) {
    cartItem.itemQty += itemQty
    await cartItem.save()
  } else {
    cartItem = await CartItem.create({
      cartId: cart._id,
      productId: product,
      itemQty
    })
  }

  await updateCartTotals(cart._id)

  return {
    status: 'success',
    message: req.__('cart.item_added'),
    data: cartItem
  }
}

exports.updateCartItemService = async (req) => {
  const { cartItemId } = req.params
  const { itemQty } = req.body

  let cartItem = await CartItem.findById(cartItemId).populate('productId')
  if (!cartItem) {
    throw CreateError(404, req.__('cart.item_not_found'))
  }

  cartItem.itemQty = itemQty
  await cartItem.save()

  // await updateCartTotals(cartItem.cartId)

  return {
    status: 'success',
    message: req.__('cart.item_updated'),
    data: cartItem
  }
}

exports.deleteCartItemService = async (req) => {
  const { cartItemId } = req.params

  const cartItem =
    await CartItem.findByIdAndDelete(cartItemId).populate('productId')
  if (!cartItem) {
    throw CreateError(404, req.__('cart.item_not_found'))
  }

  await updateCartTotals(cartItem.cartId)

  return {
    status: 'success',
    message: req.__('cart.item_deleted')
  }
}
