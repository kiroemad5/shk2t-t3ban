const Joi = require('joi')

const reviewSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid User ID format'
    }),

  productId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    // .required()
    .messages({
      // 'any.required': 'Product ID is required',
      'string.pattern.base': 'Invalid Product ID format'
    }),

  description: Joi.string().allow('', null).messages({
    'string.base': 'Description must be a string'
  }),

  rateNum: Joi.number().integer().min(1).max(5).required().messages({
    'any.required': 'Rate is required',
    'number.base': 'Rate must be a number',
    'number.min': 'Rate must be at least 1',
    'number.max': 'Rate cannot be more than 5'
  }),

  date: Joi.date().default(Date.now)
})

const reviewReplySchema = Joi.object({
  reply: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Reply is required',
    'string.min': 'Reply must be at least 1 character',
    'string.max': 'Reply cannot be more than 2000 characters',
    'any.required': 'Reply is required'
  })
})

module.exports = { reviewSchema, reviewReplySchema }
