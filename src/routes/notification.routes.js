const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/protect.middleware')
const { restrictTo } = require('../middlewares/restrictTo.middleware')
const validateBody = require('../middlewares/validateBody.middleware')
const { validateQuery } = require('../middlewares/validateQuery.middleware')
const {
  createNotificationSchema,
  getNotificationsSchema
} = require('../schemas/notification.schema')
const {
  createNotificationController,
  // getUnreadCountController,
  markNotificationAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  deleteAllNotificationsController,
  getNotificationsController,
  getNotificationsForOperationController
} = require('../controllers/notification.controller')
const { roles } = require('../types/user.enum')

// Apply authentication middleware to all routes
router.use(protect)

// Get notifications for authenticated user
router.get('/', getNotificationsController)
router.get(
  '/operations',
  restrictTo(roles.Operation),
  getNotificationsForOperationController
)
// Create notification (Admin only)
router.post(
  '/',
  validateBody(createNotificationSchema),
  createNotificationController
)

// Get unread notifications count
// router.get('/unread-count', getUnreadCountController)

// Mark notification as read
router.patch('/:id/read', markNotificationAsReadController)

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsReadController)

// Delete a specific notification
router.delete('/:id', deleteNotificationController)

// Delete all notifications for user
router.delete('/', deleteAllNotificationsController)

module.exports = router
