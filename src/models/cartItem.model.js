const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    itemQty: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
)

const CartItem = mongoose.model('CartItem', cartItemSchema)
module.exports = CartItem
