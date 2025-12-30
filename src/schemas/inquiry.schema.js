const Joi = require('joi')

const createInquirySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.empty': 'inquiry.name_empty',
    'string.min': 'inquiry.name_min_length',
    'string.max': 'inquiry.name_max_length'
  }),
  description: Joi.string().trim().min(10).max(1000).required().messages({
    'string.empty': 'inquiry.description_empty',
    'string.min': 'inquiry.description_min_length',
    'string.max': 'inquiry.description_max_length',
    'any.required': 'inquiry.description_required'
  }),
  phoneNumber: Joi.string()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .optional()
    .messages({
      'string.pattern.base': 'user.validation.invalid_phone'
    }),
  email: Joi.string().email().lowercase().trim().optional().messages({
    'string.email': 'inquiry.email_invalid'
  }),
  imageList: Joi.array().items(Joi.string().uri()).max(5).messages({
    'string.uri': 'inquiry.image_invalid',
    'array.max': 'inquiry.image_limit_exceeded'
  })
})

const replyInquirySchema = Joi.object({
  reply: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'inquiry.reply_empty',
    'string.min': 'inquiry.reply_min_length',
    'string.max': 'inquiry.reply_max_length',
    'any.required': 'inquiry.reply_required'
  })
})

const addReplySchema = Joi.object({
  text: Joi.string().trim().min(5).max(2000).required().messages({
    'string.empty': 'inquiry.reply_text_empty',
    'string.min': 'inquiry.reply_text_min_length',
    'string.max': 'inquiry.reply_text_max_length',
    'any.required': 'inquiry.reply_text_required'
  })
})

const acceptReplySchema = Joi.object({
  replyId: Joi.string().required().messages({
    'string.empty': 'inquiry.reply_id_empty',
    'any.required': 'inquiry.reply_id_required'
  })
})

const updateInquirySchema = Joi.object({
  description: Joi.string().trim().min(10).max(1000).messages({
    'string.min': 'inquiry.description_min_length',
    'string.max': 'inquiry.description_max_length'
  })
})

module.exports = {
  createInquirySchema,
  replyInquirySchema,
  addReplySchema,
  acceptReplySchema,
  updateInquirySchema
}
