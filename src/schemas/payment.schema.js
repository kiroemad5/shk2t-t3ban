const Joi = require('joi')
const { paymentType } = require('../types/payment.enum')

const createPaymentSchema = Joi.object({
  orderId: Joi.string().optional().messages({
    'string.base': 'payment.OrderId must be a string'
  }),

  paymentStatus: Joi.string()
    .valid('paid', 'deposit', 'refunded', 'cancelled')
    .required()
    .messages({
      'any.only': 'payment.Invalid payment status',
      'any.required': 'payment.Payment status is required'
    }),

  paymentWay: Joi.string().valid('cash', 'online').required().messages({
    'any.only': 'payment.Invalid payment way',
    'any.required': 'payment.Payment way is required'
  }),
  type: Joi.string()
    .valid(...Object.values(paymentType))
    .required()
    .messages({
      'any.only': 'payment.Invalid payment type',
      'any.required': 'payment.Payment type is required'
    }),
  paymentWith: Joi.string()
    .valid('instaPay', 'vodafone')
    .when('paymentWay', {
      is: 'online',
      then: Joi.required().messages({
        'any.required': 'payment.PaymentWith is required for online payments'
      }),
      otherwise: Joi.optional()
    }),

  NumOperation: Joi.string().optional().messages({
    'string.base': 'payment.NumOperation must be a string'
  }),

  totalPrice: Joi.number().min(0).required().messages({
    'any.required': 'payment.Total price is required',
    'number.base': 'payment.Total price must be a number',
    'number.min': 'payment.Total price cannot be negative'
  })
})

const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid('paid', 'deposit', 'refunded', 'cancelled')
    .required()
    .messages({
      'any.only': 'payment.Invalid payment status',
      'any.required': 'payment.Payment status is required'
    })
})

// const getPaymentByOrderSchema = Joi.object({
//   orderId: Joi.string().required().messages({
//     'any.required': 'OrderId is required',
//     'string.base': 'OrderId must be a string'
//   })
// })

// module.exports = {
//   getPaymentByOrderSchema
// }

module.exports = {
  createPaymentSchema,
  updatePaymentStatusSchema
  //   getPaymentByOrderSchema
}
