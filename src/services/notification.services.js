const Notification = require('../models/notification.model')
const { roles } = require('../types/user.enum')
const ApiFeatures = require('../utils/apiFeatures')
const logger = require('../utils/logger')
const CreateError = require('http-errors')

exports.createNotificationServices = async (req, res) => {
  const notification = await Notification.create(req.body)

  return {
    status: 'success',
    message: req.__('notification.created_successfully'),
    notification
  }
}

exports.createNotificationWithSession = async (notificationData, session) => {
  const [notification] = await Notification.create([notificationData], {
    session
  })
  // console.log('notification', notification)
  return notification
}

exports.getNotificationsForUserServices = async (req, res) => {
  try {
    const features = new ApiFeatures(
      Notification.find({ userID: req.user._id }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const notifications = await features.query
    const unreadCount = await Notification.countDocuments({
      userID: req.user._id,
      isRead: false
    })

    return {
      status: 'success',
      unreadCount,
      data: notifications
    }
  } catch (error) {
    logger.error('Error getting notifications for user:', error)
    throw CreateError(500, req.__('notification.error_getting_notifications'))
  }
}

exports.getNotificationsForOperationServices = async (req, res) => {
  // const notifications = await Notification.find({ userType: roles.Operation })

  const features = new ApiFeatures(
    Notification.find({ userType: roles.Operation }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const notifications = await features.query
  const unreadCount = await Notification.countDocuments({
    userType: roles.Operation,
    isRead: false
  })

  return {
    status: 'success',
    unreadCount,
    data: notifications
  }
}

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userID: req.user._id },
    { isRead: true },
    { new: true }
  )

  if (!notification) {
    throw CreateError(404, req.__('notification.not_found'))
  }

  return {
    success: true,
    data: notification,
    message: req.__('notification.updated_successfully')
  }
}

exports.markAllAsRead = async (req, res) => {
  let query = {}
  if (req.user.role === roles.User) {
    query = { userID: req.user._id, isRead: false }
  } else {
    query = { userType: roles.Operation, isRead: false }
  }
  const result = await Notification.updateMany(query, { isRead: true })
  return {
    success: true,
    message: req.__('notification.updated_successfully'),
    data: { updatedCount: result.modifiedCount }
  }
}

exports.deleteNotification = async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userID: req.user._id
  })

  if (!notification) {
    throw CreateError(404, req.__('notification.not_found'))
  }

  return {
    success: true,
    message: req.__('notification.deleted_successfully')
  }
}

exports.deleteAllNotifications = async (req, res) => {
  const result = await Notification.deleteMany({ userID: req.user._id })
  if (result.deletedCount == 0) {
    return {
      success: true,
      message: req.__('notification.nothing_to_delete')
    }
  } else
    return {
      success: true,
      message: req.__('notification.deleted_successfully'),
      deletedCount: result.deletedCount
    }
}
