const Joi = require('joi')
const { Department } = require('../types/user.enum')

const NormalSignupSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'any.required': 'user.First name is required'
  }),
  lastName: Joi.string().trim().required().messages({
    'any.required': 'user.Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'user.Invalid email format',
    'any.required': 'user.email is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%,^&*_])[A-Za-z\d!@#$%,^&*_]{8,}$/
    )
    .required()
    .messages({
      'string.min': 'user.password_min_length',
      'any.required': 'user.Password is required',
      'string.pattern.base': 'user.validation.invalid_password'
    }),
  phoneNumber: Joi.string()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'user.validation.invalid_phone',
      'any.required': 'user.phoneNumber is required'
    })
  ,
  organizationId: Joi.string().trim()
})

const socialSchema = Joi.object({
  provider: Joi.string().valid('google', 'facebook').required(),
  idToken: Joi.string().required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'user.Invalid email format',
    'any.required': 'user.email is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%,^&*_])[A-Za-z\d!@#$%,^&*_]{8,}$/
    )
    .required()
    .messages({
      'string.min': 'user.password_min_length',
      'any.required': 'user.Password is required',
      'string.pattern.base': 'user.validation.invalid_password'
    })
})

const ConfirmOTPSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'user.Invalid email format',
    'any.required': 'user.email is required',
    'string.empty': 'user.email is required'
  }),
  OTP: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'any.required': 'user.OTP is required',
      'string.empty': 'user.OTP is required',
      'string.pattern.base': 'user.OTP must be 6 digits long.'
    }),
  type: Joi.string().valid('EmailVerification', 'passwordReset').required()
})

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'user.Invalid email format',
    'any.required': 'user.email is required'
  })
})

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'user.Invalid email format',
    'any.required': 'user.email is required'
  }),
  Newpassword: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%,^&*_])[A-Za-z\d!@#$%,^&*_]{8,}$/
    )
    .required()
    .messages({
      'string.min': 'user.password_min_length',
      'any.required': 'user.Password is required',
      'string.pattern.base': 'user.validation.invalid_password'
    })
})

const OTPResendSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'user.Invalid email format',
    'any.required': 'user.email is required'
  }),
  type: Joi.string().valid('EmailVerification', 'passwordReset').required()
})

module.exports = {
  NormalSignupSchema,
  socialSchema,
  loginSchema,
  ConfirmOTPSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  OTPResendSchema
}
