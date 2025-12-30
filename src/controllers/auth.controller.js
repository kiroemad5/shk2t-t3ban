const { v4 } = require('uuid')
const {
  signupServices,
  signWithsocialServices,
  loginServices,
  ConfirmOTPServices,
  forgetPasswordServices,
  OTPResendServices,
  resetPasswordServices
} = require('../services/auth.services.js')
const CreateError = require('http-errors')

const signupCotroller = async (req, res, next) => {
  try {
    const result = await signupServices(req)
    res.status(200).json(result)
  } catch (error) {
    if ((error && error.code === 11000) || error?.message?.includes('E11000')) {
      next(CreateError(409, req.__('user.already_exists')))
    }
    next(error)
  }
}

const loginCotroller = async (req, res, next) => {
  try {
    const result = await loginServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const signWithsocialCotroller = async (req, res, next) => {
  try {
    const result = await signWithsocialServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const ConfirmOTPCotroller = async (req, res, next) => {
  try {
    const result = await ConfirmOTPServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const forgetPasswordCotroller = async (req, res, next) => {
  try {
    const result = await forgetPasswordServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const resetPasswordCotroller = async (req, res, next) => {
  try {
    const result = await resetPasswordServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const OTPResendCotroller = async (req, res, next) => {
  try {
    const result = await OTPResendServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  signupCotroller,
  signWithsocialCotroller,
  loginCotroller,
  ConfirmOTPCotroller,
  forgetPasswordCotroller,
  resetPasswordCotroller,
  OTPResendCotroller
}
