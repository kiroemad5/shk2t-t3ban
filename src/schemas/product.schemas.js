const Joi = require('joi')

const createProductSchema = Joi.object({
  category: Joi.string().required().messages({
    'any.required': 'product.Category is required'
  }),
  name: Joi.string().trim().required().messages({
    'any.required': 'product.Name is required'
  }),
  description: Joi.string().allow('', null),
  imageList: Joi.array().items(Joi.string().uri()).max(5).messages({
    'string.uri': 'product.Invalid image URL'
  }),
  price: Joi.number().positive().required().messages({
    'any.required': 'product.Price is required',
    'number.positive': 'product.Price must be positive'
  }),
  PurchasePrice: Joi.number().positive().required().messages({
    'any.required': 'product.PurchasePrice is required',
    'number.positive': 'product.PurchasePrice must be positive'
  }),
  stockQty: Joi.number().integer().min(0).default(0).messages({
    'number.min': 'product.Stock cannot be negative'
  }),
  advProduct: Joi.array().items(Joi.string()).default([]).messages({
    'array.base': 'product.advProduct must be an array of strings',
    'string.base': 'product.advProduct items must be strings'
  }),
  qualityGrade: Joi.string().valid('first', 'second', 'third', 'fourth').optional().messages({
    'any.only': 'product.Quality grade must be one of: first, second, third, fourth'
  }),
  color: Joi.string().optional().messages({
    'string.base': 'product.Color must be a string'
  })
})

const updateProductSchema = Joi.object({
  category: Joi.string().messages({
    'any.required': 'product.Category is required'
  }),
  name: Joi.string().trim().messages({
    'any.required': 'product.Name is required'
  }),
  description: Joi.string().allow('', null),
  imageList: Joi.array()
    .max(5)
    .items(
      Joi.object({
        link: Joi.string().uri().required().messages({
          'string.uri': 'product.Invalid image URL',
          'any.required': 'product.Image link is required'
        })
      })
    )
    .messages({
      'array.max': 'product.You can upload up to 5 images'
    }),
  Deleteimage: Joi.string().optional().messages({
    'string.base': 'product.Deleteimage must be a string'
  }),
  price: Joi.number().positive().optional().messages({
    'any.required': 'product.Price is required',
    'number.positive': 'product.Price must be positive'
  }),
  PurchasePrice: Joi.number().positive().optional().messages({
    'any.required': 'product.PurchasePrice is required',
    'number.positive': 'product.PurchasePrice must be positive'
  }),
  stockQty: Joi.number().integer().min(0).optional().messages({
    'number.min': 'product.Stock cannot be negative'
  }),
  advProduct: Joi.array().items(Joi.string()).messages({
    'array.base': 'product.advProduct must be an array of strings',
    'string.base': 'product.advProduct items must be strings'
  }),
  qualityGrade: Joi.string().valid('first', 'second', 'third', 'fourth').optional().messages({
    'any.only': 'product.Quality grade must be one of: first, second, third, fourth'
  }),
  color: Joi.string().optional().messages({
    'string.base': 'product.Color must be a string'
  })
})

module.exports = { createProductSchema, updateProductSchema }
