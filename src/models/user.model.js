const mongoose = require('mongoose')
const validator = require('validator')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs/dist/bcrypt')
const logger = require('../utils/logger')
const { sendEmail } = require('../utils/email')
const emailConstants = require('../constants/email.json')
const { roles, Department } = require('../types/user.enum')
const { showPassword } = require('../utils/manageOperationPassword')
const { v4 } = require('uuid')

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'user.Please add a valid email']
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
      validate(value) {
        const password = new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%,^&*_])[A-Za-z\\d!@#$%,^&*_]{8,}$'
        )
        if (!password.test(value)) {
          throw new Error(
            'Password must include uppercase , lowercase , numbers , special characters'
          )
        }
      }
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.User
    },
    organizationId: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: null
    },
    operationId: {
      type: String,
      default: null
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (val) {
          if (!val) return true
          return /^(\+2)?01[0-2,5][0-9]{8}$/.test(val)
        },
        message: 'Please add a valid phone number'
      },
      default: null
    },
    address: [
      {
        firstName: {
          type: String,
          required: true,
          trim: true
        },
        lastName: {
          type: String,
          required: true,
          trim: true
        },
        phoneNumber: {
          type: String,
          validate: {
            validator: function (val) {
              if (!val) return true
              return /^(\+2)?01[0-2,5][0-9]{8}$/.test(val)
            },
            message: 'Please add a valid phone number'
          },
          required: true
        },
        address: {
          type: String,
          required: true
        },
        city: {
          type: String,
          required: true
        },
        region: {
          type: String,
          required: true
        },
        isDefault: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    department: {
      type: String,
      enum: Object.values(Department),
      default: Department.E_Commerce
    },
    salary: {
      type: Number,
      default: null
    },
    dateOfSubmission: {
      type: Date,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    EmailVerificationToken: String,
    EmailVerificationExpires: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

userSchema.index({ EmailVerificationExpires: 1 }, { expireAfterSeconds: 0 })
userSchema.index({ organizationId: 1, role: 1 })

userSchema.virtual('favoriteItems', {
  ref: 'WishItem',
  localField: '_id',
  foreignField: 'userId',
  count: true
})

userSchema.virtual('reviewsCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'userId',
  count: true
})

userSchema.virtual('OrderCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId',
  count: true
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.role == roles.User && !this.organizationId) {
    this.organizationId = process.env.DEFAULT_ORGANIZATION_ID
  }
  if (this.role == roles.Operation && this.isNew) {
    this.operationId =
      'OP' +
      new Date().getFullYear().toString().slice(2) +
      (new Date().getMonth() + 1).toString().padStart(2, '0') +
      this.department.toString().substring(0, 1).toUpperCase() +
      ((await User.countDocuments({ role: roles.Operation })) + 1)
        .toString()
        .padStart(4, '0')
  }
  if (
    this.role == roles.Operation &&
    (this.isModified('password') || this.isNew)
  ) {
    this.password = jwt.sign(this.password, process.env.JWT_SECRET)
  } else if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = Date.now() - 1000
  next()
})

// Middleware للـ findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate()
  // console.log('update.role', update.password)

  if (update.password) {
    // console.log('update.role', update.role)
    // تشفير الباسورد قبل التحديث
    if (update.role == roles.Operation) {
      // console.log('update.password', update.password)
      update.password = jwt.sign(update.password, process.env.JWT_SECRET)
    } else {
      update.password = await bcrypt.hash(update.password, 12)
    }
    // تحديث passwordChangedAt
    update.passwordChangedAt = Date.now() - 1000
  }
  next()
})

userSchema.methods.checkPassword = async function (enteredPassword) {
  if (this.role == roles.Operation) {
    return (await showPassword(this.password)) == enteredPassword
  } else {
    return await bcrypt.compare(enteredPassword, this.password)
  }
}

userSchema.methods.createAndSendOTP = async function (field) {
  const OTP = crypto.randomInt(100000, 1000000).toString()
  this[field + 'Token'] = crypto.createHash('sha256').update(OTP).digest('hex')
  logger.info('OTP', { OTP })

  this[field + 'Expires'] = Date.now() + 10 * 60 * 1000

  const subject = emailConstants.subject[field]
  const message = emailConstants.message[field]

  await sendEmail({
    email: this.email,
    subject,
    message,
    OTP
  })
  await this.save({ validateBeforeSave: false })
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changeTimestamp
  }
  return false
}

const User = mongoose.model('User', userSchema)
module.exports = User
