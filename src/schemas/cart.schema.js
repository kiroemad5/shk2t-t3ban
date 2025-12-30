const Joi = require('joi')

const cartTotalSchema = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'UserId is required',
    'string.base': 'UserId must be a string'
  }),
  totalQty: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Total quantity must be a number',
    'number.min': 'Total quantity cannot be negative'
  }),
  totalPrice: Joi.number().min(0).default(0).messages({
    'number.base': 'Total price must be a number',
    'number.min': 'Total price cannot be negative'
  })
})

module.exports = { cartTotalSchema }
