const User = require('../models/user.model')
const { createToken } = require('../utils/createToken')
const logger = require('../utils/logger')
const CreateError = require('http-errors')
const { loginWithSocial } = require('../utils/signSocial')
const crypto = require('crypto')
const { roles } = require('../types/user.enum')
const {
  createPassword,
  showPassword
} = require('../utils/manageOperationPassword')
const { token } = require('morgan')

exports.signWithsocialServices = async (req, res) => {
  logger.info('POST /app/v1/users/signWithsocial endpoint called', {
    lang: req.getLocale()
  })

  const user = await loginWithSocial(req.body)
  const token = createToken(user, res)
  delete user._doc.password
  return {
    status: 'success',
    data: { user, token }
  }
}

exports.signupServices = async (req) => {
  logger.info('POST users/signup endpoint called', req.body, {
    lang: req.getLocale()
  })
  const organizationId =
    req.body.organizationId || process.env.DEFAULT_ORGANIZATION_ID
  if (!organizationId) {
    throw CreateError(400, req.__('user.organization_required'))
  }
  const user = await User.create({
    ...req.body,
    organizationId
  })
  user.createAndSendOTP('EmailVerification')
  delete user._doc.password

  return {
    status: 'success',
    message: req.__('user.check_email_for_otp_verify_email'),
    data: { user }
  }
}

exports.ConfirmOTPServices = async (req, res) => {
  const type = req.body.type
  const tokenField = type + 'Token'
  const expiresField = type + 'Expires'
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.OTP)
    .digest('hex')
  const user = await User.findOne({
    email: req.body.email,
    [tokenField]: hashedToken,
    [expiresField]: { $gt: Date.now() }
  })

  if (!user) {
    throw CreateError(401, req.__('user.otp_invalid_or_expired_try_again'))
  }
  user[tokenField] = undefined
  user[expiresField] = undefined
  user.isVerified = type == 'EmailVerification' ? true : false
  await user.save()
  if (type == 'EmailVerification')
    return {
      status: 'success',
      message: req.__('user.email_verified'),
      data: { token: createToken(user, res) }
    }
  else {
    return {
      status: 'success',
      message: req.__('user.email_verified')
    }
  }
}

exports.loginServices = async (req, res) => {
  logger.info('POST users/login endpoint called', {
    lang: req.getLocale()
  })
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.checkPassword(password))) {
    throw CreateError(401, req.__('user.incorrect_email_or_password'))
  }
  if (user.EmailVerificationToken) {
    throw CreateError(401, req.__('user.please_verify_email_first'))
  }
  const token = createToken(user, res)
  // logger.info('token ', user._doc)
  delete user._doc.password

  return {
    status: 'success',
    message: req.__('user.login_successful'),
    data: { token, user }
  }
}

exports.forgetPasswordServices = async (req) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user || user.length === 0) {
    throw CreateError(401, req.__('user.user_not_found'))
  }
  user.isVerified = false
  logger.info('Forget password OTP', {
    lang: req.getLocale()
  })
  user.createAndSendOTP('passwordReset')
  await user.save()

  return {
    status: 'success',
    message: req.__('user.check_email_for_password_reset_otp')
  }
}

exports.resetPasswordServices = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    isVerified: false,
    passwordResetToken: undefined
  })
  if (!user || user.length === 0) {
    throw CreateError(401, req.__('user.user_not_found'))
  }
  logger.info('Reset password', {
    lang: req.getLocale()
  })
  user.isVerified = true
  user.password = req.body.Newpassword
  await user.save()
  const token = createToken(user, res)
  return {
    status: 'success',
    message: req.__('user.user_password_updated_successfully'),
    data: { user, token }
  }
}

exports.OTPResendServices = async (req) => {
  const user = await User.findOne({ email: req.body.email, isVerified: false })
  if (!user || user.length === 0) {
    throw CreateError(401, req.__('user.user_not_found'))
  }
  logger.info('Resend OTP', {
    lang: req.getLocale()
  })
  user.createAndSendOTP(req.body.type)
  await user.save()

  return {
    status: 'success',
    message: req.__('user.please_check_email_for_otp')
  }
}
