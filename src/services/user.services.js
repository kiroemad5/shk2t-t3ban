const logger = require('../utils/logger')
const User = require('../models/user.model')
const CreateError = require('http-errors')
const {
  createPassword,
  showPassword
} = require('../utils/manageOperationPassword')
const { roles } = require('../types/user.enum')
const { v4 } = require('uuid')
const jwt = require('jsonwebtoken')

exports.UpdatePasswordServices = async (req) => {
  const user = await User.findOne({ email: req.user.email }).select('+password')
  if (!user || user.length === 0) {
    throw CreateError(401, req.__('user.user_not_found'))
  }
  logger.info('update password OTP', {
    lang: req.getLocale()
  })
  if (!(await user.checkPassword(req.body.OldPassword))) {
    throw CreateError(401, req.__('user.incorrect_password'))
  }
  user.password = req.body.NewPassword
  await user.save()

  return {
    status: 'success',
    message: req.__('user.password_updated_successfully_message')
  }
}

exports.getUserServices = async (req) => {
  logger.info('get user details', {
    lang: req.getLocale()
  })

  return {
    status: 'success',
    message: req.__('user.profile_retrieved_successfully_message'),
    user: req.user
  }
}

exports.updateUserServices = async (req) => {
  logger.info('update user ', {
    lang: req.getLocale()
  })
  const editedUser = req.body
  if (req.files?.image) {
    editedUser.image = req.files.image[0].path
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, editedUser, {
    new: true,
    runValidators: true
  })
  return {
    status: 'success',
    message: req.__('user.profile_updated_successfully_message'),
    user: updatedUser
  }
}

exports.updateOperationServices = async (req) => {
  logger.info('update operation ', {
    lang: req.getLocale()
  })
  const editedUser = req.body
  if (editedUser.password) {
    if (!editedUser.adminPassword)
      throw CreateError(
        401,
        req.__('user.Enter admin password to change operation password')
      )

    const currentUser = await User.findById(req.user.id).select('+password')
    if (
      !currentUser ||
      !(await currentUser.checkPassword(editedUser.adminPassword))
    ) {
      throw CreateError(401, req.__('user.incorrect_password'))
    }
    delete editedUser.adminPassword
  }
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.params.Id },
    { ...editedUser, role: roles.Operation },
    {
      new: true
    }
  ).select('+password')

  return {
    status: 'success',
    message: req.__('user.operation_updated_successfully'),
    user: updatedUser
  }
}

exports.addAddressServices = async (req) => {
  logger.info('Add address', {
    lang: req.getLocale()
  })

  const user = req.user
  if (!user) {
    throw CreateError(404, req.__('user.user_not_found'))
  }

  // Create new address object with all required fields
  const newAddress = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    city: req.body.city,
    region: req.body.region
  }

  user.address.push(newAddress)
  await user.save()

  return {
    status: 'success',
    message: req.__('user.address_added_successfully_message'),
    address: user.address
  }
}

exports.updateAddressServices = async (req) => {
  logger.info('Update address', {
    lang: req.getLocale()
  })

  const user = req.user
  if (!user) {
    throw CreateError(404, req.__('user.user_not_found'))
  }

  const addressIndex = user.address.findIndex(
    (addr) => addr._id.toString() === req.body.addressId
  )
  if (addressIndex === -1) {
    throw CreateError(404, req.__('user.address_not_found'))
  }

  if (req.body.firstName)
    user.address[addressIndex].firstName = req.body.firstName
  if (req.body.lastName) user.address[addressIndex].lastName = req.body.lastName
  if (req.body.phoneNumber)
    user.address[addressIndex].phoneNumber = req.body.phoneNumber
  if (req.body.address) user.address[addressIndex].address = req.body.address
  if (req.body.region) user.address[addressIndex].region = req.body.region
  if (req.body.isDefault === true) {
    user.address.forEach((addr) => {
      addr.isDefault = false
    })
    user.address[addressIndex].isDefault = req.body.isDefault
  } else if (req.body.isDefault === false) {
    user.address[addressIndex].isDefault = req.body.isDefault
  }

  await user.save()

  return {
    status: 'success',
    message: req.__('user.address_updated_successfully_message'),
    address: user.address
  }
}

exports.deleteAddressServices = async (req) => {
  logger.info('Delete address', {
    lang: req.getLocale()
  })

  const user = req.user
  if (!user) {
    throw CreateError(404, req.__('user.user_not_found'))
  }

  const addressIndex = user.address.findIndex(
    (addr) => addr._id.toString() === req.body.addressId
  )
  if (addressIndex === -1) {
    throw CreateError(404, req.__('user.address_not_found'))
  }

  user.address.splice(addressIndex, 1)
  await user.save()

  return {
    status: 'success',
    message: req.__('user.address_deleted_successfully_message'),
    address: user.address
  }
}

exports.createoperationServices = async (req) => {
  logger.info('POST users/create operation endpoint called', req.body, {
    lang: req.getLocale()
  })

  const organizationId =
    req.body.organizationId || process.env.DEFAULT_ORGANIZATION_ID
  if (!organizationId) {
    throw CreateError(400, req.__('user.organization_required'))
  }

  const password = createPassword()
  const user = await User.create({
    ...req.body,
    role: roles.Operation,
    organizationId,
    password,
    isVerified: true
  })
  user._doc.password = password

  return {
    status: 'success',
    message: req.__('user.operation_created_successfully_message'),
    user
  }
}

exports.showPasswordServices = async (req) => {
  logger.info('POST users/show password endpoint called', req.body, {
    lang: req.getLocale()
  })
  const { password, email } = req.query
  const currentUser = await User.findById(req.user.id).select('+password')
  if (!currentUser || !(await currentUser.checkPassword(password))) {
    throw CreateError(401, req.__('user.incorrect_password'))
  }
  const operation = await User.findOne({ email }).select('+password')
  if (!operation) {
    throw CreateError(401, req.__('user.incorrect_operation'))
  }
  const pass = await showPassword(operation.password)
  return {
    status: 'success',
    data: { password: pass }
  }
}

exports.getAllOperationServices = async (req) => {
  logger.info('get All operation details', {
    lang: req.getLocale()
  })

  const operations = await User.find({ role: roles.Operation })

  return {
    status: 'success',
    message: req.__('user.operations_retrieved_successfully_message'),
    length: operations.length,
    operations
  }
}

exports.getCustomersStatisticsServices = async (req) => {
  logger.info('get Customers Statistics', {
    lang: req.getLocale()
  })

  const monthlyStatistics = await User.aggregate([
    {
      $match: {
        role: roles.User
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        monthName: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id.month', 1] }, then: 'يناير' },
              { case: { $eq: ['$_id.month', 2] }, then: 'فبراير' },
              { case: { $eq: ['$_id.month', 3] }, then: 'مارس' },
              { case: { $eq: ['$_id.month', 4] }, then: 'أبريل' },
              { case: { $eq: ['$_id.month', 5] }, then: 'مايو' },
              { case: { $eq: ['$_id.month', 6] }, then: 'يونيو' },
              { case: { $eq: ['$_id.month', 7] }, then: 'يوليو' },
              { case: { $eq: ['$_id.month', 8] }, then: 'أغسطس' },
              { case: { $eq: ['$_id.month', 9] }, then: 'سبتمبر' },
              { case: { $eq: ['$_id.month', 10] }, then: 'أكتوبر' },
              { case: { $eq: ['$_id.month', 11] }, then: 'نوفمبر' },
              { case: { $eq: ['$_id.month', 12] }, then: 'ديسمبر' }
            ],
            default: 'غير محدد'
          }
        },
        count: 1
      }
    }
  ])

  const yearlyStatistics = await User.aggregate([
    {
      $match: {
        role: roles.User
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        count: 1
      }
    }
  ])

  // حساب العدد الإجمالي للمستخدمين
  const totalCustomers = await User.countDocuments({ role: roles.User })

  return {
    status: 'success',
    message: req.__('user.customers_statistics_retrieved_successfully'),
    data: {
      totalCustomers,
      monthlyStatistics,
      yearlyStatistics
    }
  }
}

exports.getOperationsStatisticsServices = async (req) => {
  logger.info('get Operation Statistics', {
    lang: req.getLocale()
  })

  const Operations = await User.aggregate([
    {
      $match: {
        role: roles.Operation
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        monthName: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id.month', 1] }, then: 'يناير' },
              { case: { $eq: ['$_id.month', 2] }, then: 'فبراير' },
              { case: { $eq: ['$_id.month', 3] }, then: 'مارس' },
              { case: { $eq: ['$_id.month', 4] }, then: 'أبريل' },
              { case: { $eq: ['$_id.month', 5] }, then: 'مايو' },
              { case: { $eq: ['$_id.month', 6] }, then: 'يونيو' },
              { case: { $eq: ['$_id.month', 7] }, then: 'يوليو' },
              { case: { $eq: ['$_id.month', 8] }, then: 'أغسطس' },
              { case: { $eq: ['$_id.month', 9] }, then: 'سبتمبر' },
              { case: { $eq: ['$_id.month', 10] }, then: 'أكتوبر' },
              { case: { $eq: ['$_id.month', 11] }, then: 'نوفمبر' },
              { case: { $eq: ['$_id.month', 12] }, then: 'ديسمبر' }
            ],
            default: 'غير محدد'
          }
        },
        count: 1
      }
    }
  ])

  // حساب العدد الإجمالي للمستخدمين
  const totalOperations = await User.countDocuments({ role: roles.Operation })

  return {
    status: 'success',
    message: req.__('user.operations_statistics_retrieved_successfully'),
    data: {
      totalOperations,
      Operations
    }
  }
}
