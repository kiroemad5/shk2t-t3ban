const mongoose = require('mongoose')
const {
  paymentStatus,
  paymentWay,
  paymentWith,
  paymentType
} = require('../types/payment.enum')

/**
 * Payment Model
 * Stores all payment transaction details for orders
 * Tracks payment status, method, and transaction information
 * Links payments to users and orders for order fulfillment tracking
 */
const paymentSchema = new mongoose.Schema(
  {
    /**
     * User who made the payment
     * References the User model
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    /**
     * Order ID associated with this payment
     * String reference to the Order model
     * Must be unique (one payment per order)
     */
    orderId: {
      type: String,
      ref: 'Order',
      unique: true,
      required: true
    },

    /**
     * Current status of the payment
     * Values: 'pending', 'completed', 'failed', 'cancelled' etc.
     * Defined in payment.enum.js
     */
    paymentStatus: {
      type: String,
      enum: Object.values(paymentStatus),
      required: true
    },

    /**
     * Payment method/channel used
     * Values: 'credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery' etc.
     * Defined in payment.enum.js
     */
    paymentWay: {
      type: String,
      enum: Object.values(paymentWay),
      required: true
    },

    /**
     * Payment instrument/wallet used
     * Values: 'visa', 'mastercard', 'paypal', 'bank_account' etc.
     * Defined in payment.enum.js
     * Optional field
     */
    paymentWith: {
      type: String,
      enum: Object.values(paymentWith)
    },

    /**
     * Type of payment transaction
     * Values: 'Revenues' (customer payment), 'Refund', 'Commission' etc.
     * Default: 'Revenues'
     * Defined in payment.enum.js
     */
    type: {
      type: String,
      enum: Object.values(paymentType),
      default: paymentType.Revenues
    },

    /**
     * Operation/Transaction reference number
     * Unique identifier from payment gateway (e.g., Stripe, PayPal)
     * Used to track transaction in external payment systems
     */
    NumOperation: {
      type: String,
      default: null
    },

    /**
     * Receipt or proof of payment image URL
     * Cloudinary URL for manual payment proof (bank transfers, cash)
     * Optional field
     */
    image: {
      type: String,
      default: null
    },

    /**
     * Total amount paid for the order
     * Includes product price + delivery fee
     * In the currency unit (usually Egyptian Pounds)
     */
    totalPrice: {
      type: Number,
      required: true
    },

    /**
     * List of operation/staff IDs who processed/verified this payment
     * Tracks which operations (admins) handled the payment
     * Used for audit trail
     */
    operationIds: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

/**
 * Payment Methods Summary:
 * - paymentStatus: pending | completed | failed | cancelled
 * - paymentWay: card | bank_transfer | wallet | cash_on_delivery
 * - paymentWith: visa | mastercard | paypal | bank_account
 * - type: Revenues (customer payment) | Refund | Commission
 */

const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment
