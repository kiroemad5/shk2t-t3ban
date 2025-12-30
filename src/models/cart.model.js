const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    totalQty: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    isBecomeOrder: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

cartSchema.virtual('items', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'cartId'
})

// cartSchema.virtual('userId', {
//   ref: 'User',
//   localField: 'userId',
//   foreignField: '_id'
// })


cartSchema.pre(/^find/, async function (next) {
  const options = this.getOptions()
  if (options && options.isPopulateFromOrder) {
    return next()
  }

  this.find({ isBecomeOrder: false })
  next()
})

const Cart = mongoose.model('Cart', cartSchema)
module.exports = Cart
