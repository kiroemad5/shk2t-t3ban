const Joi = require('joi')

// Schema for creating notification
const createNotificationSchema = Joi.object({
  userID: Joi.string().optional().messages({
    'string.empty': 'notification.user_id_required'
  }),
  userType: Joi.string()
    .valid('user', 'operation', 'admin')
    .optional()
    .messages({
      'any.only': 'notification.userType_invalid'
    }),
  title: Joi.string().required().messages({
    'string.empty': 'notification.title_required',
    'any.required': 'notification.title_required'
  }),
  message: Joi.string().min(5).max(500).required().messages({
    'string.empty': 'notification.message_required',
    'string.min': 'notification.message_min_length',
    'string.max': 'notification.message_max_length',
    'any.required': 'notification.message_required'
  }),
  type: Joi.string()
    .valid('info', 'success', 'warning', 'error')
    .default('info')
    .messages({
      'any.only': 'notification.type_invalid'
    }),
    actionUrl: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'notification.action_url_invalid'
  })
})

// Schema for updating notification
const updateNotificationSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'notification.title_min_length',
    'string.max': 'notification.title_max_length'
  }),
  message: Joi.string().min(5).max(500).optional().messages({
    'string.min': 'notification.message_min_length',
    'string.max': 'notification.message_max_length'
  }),
  type: Joi.string()
    .valid('info', 'success', 'warning', 'error')
    .optional()
    .messages({
      'any.only': 'notification.type_invalid'
    }),
  isRead: Joi.boolean().optional(),
  actionUrl: Joi.string().uri().allow('').optional().messages({
    'string.uri': 'notification.action_url_invalid'
  })
})

module.exports = {
  createNotificationSchema,
  updateNotificationSchema
}
