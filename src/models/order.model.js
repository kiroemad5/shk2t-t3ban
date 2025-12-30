const mongoose = require('mongoose')
const { orderStatus } = require('../types/order.enum')
const { v4 } = require('uuid')

const orderSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderId: {
      type: String,
      unique: true,
      immutable: true,
      default: () =>
        'OR' + v4().replace(/-/g, '').substring(0, 16).toUpperCase()
    },
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.UnderReview
    },
    address: {
      firstName: {
        type: String,
        required: true,
        trim: true
      },
      lastName: {
        type: String,
        required: true,
        trim: true
      },
      phoneNumber: {
        type: String,
        validate: {
          validator: function (val) {
            if (!val) return true
            return /^(\+2)?01[0-2,5][0-9]{8}$/.test(val)
          },
          message: 'Please add a valid phone number'
        },
        required: true
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      region: {
        type: String,
        required: true
      }
    },
    deliveryPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)
orderSchema.virtual('paymentDetails', {
  ref: 'Payment',
  localField: 'orderId',
  foreignField: 'orderId',
  justOne: true
})

const Order = mongoose.model('Order', orderSchema)
module.exports = Order
