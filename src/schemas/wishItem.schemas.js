const Joi = require('joi')

const wishItemSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid User ID format'
    }),

  productId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Product ID is required',
      'string.pattern.base': 'Invalid Product ID format'
    })
})

module.exports = { wishItemSchema }
