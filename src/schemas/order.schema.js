const Joi = require('joi')
const { orderStatus } = require('../types/order.enum')

exports.createOrderSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'string.base': 'order.First name must be a string',
    'any.required': 'order.First name is required'
  }),
  lastName: Joi.string().trim().required().messages({
    'string.base': 'order.Last name must be a string',
    'any.required': 'order.Last name is required'
  }),
  phoneNumber: Joi.string()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'order.Invalid phone number format',
      'any.required': 'order.Phone number is required'
    }),
  address: Joi.string().required().messages({
    'string.base': 'order.Address must be a string',
    'any.required': 'order.Address is required'
  }),
  city: Joi.string().required().messages({
    'string.base': 'order.City must be a string',
    'any.required': 'order.City is required'
  }),
  region: Joi.string().required().messages({
    'string.base': 'order.Region must be a string',
    'any.required': 'order.Region is required'
  }),
  paymentStatus: Joi.string()
    .valid('paid', 'deposit')
    .when('paymentWay', {
      is: 'online',
      then: Joi.required().valid('paid').messages({
        'any.required':
          'payment.Payment status is required for online payments',
        'any.only': 'payment.Online payments must have status "paid"'
      }),
      otherwise: Joi.required().valid('deposit').messages({
        'any.required': 'payment.Payment status is required for cash payments',
        'any.only': 'payment.Cash payments must have status "deposit"'
      })
    }),
  paymentWay: Joi.string().valid('cash', 'online').required().messages({
    'any.only': 'payment.Invalid payment way',
    'any.required': 'payment.Payment way is required'
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
  NumOperation: Joi.string().optional().allow('').messages({
    'string.base': 'payment.NumOperation must be a string'
  })
})

exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(orderStatus))
    .required()
}).messages({
  'any.required': 'order.status_required'
})
