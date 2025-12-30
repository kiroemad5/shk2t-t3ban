const mongoose = require('mongoose')

const wishItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  },
  { timestamps: true }
)

wishItemSchema.index({ userId: 1, productId: 1 }, { unique: true })

const WishItem = mongoose.model('WishItem', wishItemSchema)

module.exports = WishItem
