const Joi = require('joi')
const { Department } = require('../types/user.enum')
const UpdatePasswordSchema = Joi.object({
  OldPassword: Joi.string()
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
  NewPassword: Joi.string()
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

const AddressSchema = Joi.object({
  firstName: Joi.string().required().trim().messages({
    'any.required': 'user.firstName_required',
    'string.empty': 'user.firstName_empty'
  }),
  lastName: Joi.string().required().trim().messages({
    'any.required': 'user.lastName_required',
    'string.empty': 'user.lastName_empty'
  }),
  phoneNumber: Joi.string()
    .required()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .messages({
      'string.pattern.base': 'user.Please add a valid phone number',
      'any.required': 'user.phone Number required'
    }),
  address: Joi.string().required().trim().messages({
    'any.required': 'user.address_required',
    'string.empty': 'user.address_empty'
  }),
  city: Joi.string().required().trim().messages({
    'any.required': 'user.city_required',
    'string.empty': 'user.city_empty'
  }),
  region: Joi.string().required().trim().messages({
    'any.required': 'user.region_required',
    'string.empty': 'user.region_empty'
  }),
  isDefault: Joi.boolean().optional()
})

const UpdateAddressSchema = Joi.object({
  addressId: Joi.string().required().messages({
    'any.required': 'user.address_id_required'
  }),
  firstName: Joi.string().trim().messages({
    'string.empty': 'user.firstName_empty'
  }),
  lastName: Joi.string().trim().messages({
    'string.empty': 'user.lastName_empty'
  }),
  phoneNumber: Joi.string()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .messages({
      'string.pattern.base': 'user.Please add a valid phone number'
    }),
  address: Joi.string().trim().messages({
    'string.empty': 'user.address_empty'
  }),
  city: Joi.string().trim().messages({
    'string.empty': 'user.city_empty'
  }),
  region: Joi.string().trim().messages({
    'string.empty': 'user.region_empty'
  }),
  isDefault: Joi.boolean().optional()
})

const DeleteAddressSchema = Joi.object({
  addressId: Joi.string().required().messages({
    'any.required': 'user.address_id_required'
  })
})

const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().messages({
    'any.required': 'user.First name is required'
  }),
  lastName: Joi.string().trim().messages({
    'any.required': 'user.Last name is required'
  }),
  phoneNumber: Joi.string()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .messages({
      'string.pattern.base': 'user.validation.invalid_phone',
      'any.required': 'user.phoneNumber is required'
    })
})
  .or('firstName', 'lastName', 'phoneNumber')
  .messages({
    'object.missing':
      'user.At least one field is required (firstName, lastName, or phoneNumber)'
  })
const createOperationSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'any.required': 'user.First name is required'
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'user.Invalid email format',
    'any.required': 'user.email is required'
  }),

  phoneNumber: Joi.string()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'user.validation.invalid_phone',
      'any.required': 'user.phoneNumber is required'
    }),
  department: Joi.string()
    .trim()
    .valid(...Object.values(Department))
    .required()
    .messages({
      'any.required': 'user.Department is required',
      'any.only': 'user.Invalid department value'
    }),
  dateOfSubmission: Joi.date().required().messages({
    'any.required': 'user.Date of submission is required',
    'date.base': 'user.Invalid date format'
  }),
  salary: Joi.number().positive().required().messages({
    'any.required': 'user.Salary is required',
    'number.positive': 'user.Salary must be a positive number'
  }),
  organizationId: Joi.string().trim().required().messages({
    'any.required': 'user.organizationId is required'
  })
})
const updateOperationSchema = Joi.object({
  firstName: Joi.string().trim().messages({
    'any.required': 'user.First name is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%,^&*_])[A-Za-z\d!@#$%,^&*_]{8,}$/
    )
    .messages({
      'string.min': 'user.password_min_length',
      'string.pattern.base': 'user.validation.invalid_password'
    }),
  phoneNumber: Joi.string()
    .pattern(/^(\+2)?01[0-2,5][0-9]{8}$/)
    .messages({
      'string.pattern.base': 'user.validation.invalid_phone',
      'any.required': 'user.phoneNumber is required'
    }),
  salary: Joi.number().positive().messages({
    'number.positive': 'user.Salary must be a positive number'
  }),
  dateOfSubmission: Joi.date().messages({
    'date.base': 'user.Invalid date format'
  }),
  adminPassword: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%,^&*_])[A-Za-z\d!@#$%,^&*_]{8,}$/
    )
    .messages({
      'string.min': 'user.password_min_length',
      'string.pattern.base': 'user.validation.invalid_password'
    })
})
  .or(
    'firstName',
    'phoneNumber',
    'salary',
    'dateOfSubmission',
    'department',
    'password'
  )
  .messages({
    'object.missing':
      'user.At least one field is required (firstName, phoneNumber, salary, dateOfSubmission , department or password)'
  })

const showPasswordSchema = Joi.object({
  lang: Joi.string().valid('ar', 'en'),
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

module.exports = {
  UpdatePasswordSchema,
  AddressSchema,
  UpdateAddressSchema,
  DeleteAddressSchema,
  updateUserSchema,
  createOperationSchema,
  showPasswordSchema,
  updateOperationSchema
}
