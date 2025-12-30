const {
  getNotificationsForUserServices,
  createNotificationServices,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationsForOperationServices
} = require('../services/notification.services')

const createNotificationController = async (req, res, next) => {
  try { 
    const result = await createNotificationServices(req, res)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const getNotificationsController = async (req, res, next) => {
  try {
    const result = await getNotificationsForUserServices(req, res)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
const getNotificationsForOperationController = async (req, res, next) => {
  try {
    const result = await getNotificationsForOperationServices(req, res)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
// const getUnreadCountController = async (req, res, next) => {
//   try {
//     const count = await getUnreadCount(req, res)

//     res.status(200).json(count)
//   } catch (error) {
//     next(error)
//   }
// }

const markNotificationAsReadController = async (req, res, next) => {
  try {
    const result = await markAsRead(req, res)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const markAllAsReadController = async (req, res, next) => {
  try {
    const result = await markAllAsRead(req, res)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteNotificationController = async (req, res, next) => {
  try {
    const result = await deleteNotification(req, res)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteAllNotificationsController = async (req, res, next) => {
  try {
    const result = await deleteAllNotifications(req, res)

    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createNotificationController,
  getNotificationsController,
  // getUnreadCountController,
  markNotificationAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  deleteAllNotificationsController,
  getNotificationsForOperationController
}
