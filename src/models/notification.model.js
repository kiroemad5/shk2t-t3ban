const mongoose = require('mongoose')
const { notificationType } = require('../types/notification.enum')
const { roles } = require('../types/user.enum')

const notificationSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
      // required: true
    },
    title: {
      type: String,
      required: true
    },
    userType: {
      type: String,
      enum: Object.values(roles),
      default: roles.User
    },
    message: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500
    },
    type: {
      type: String,
      enum: Object.values(notificationType),
      default: notificationType.Info
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

// Index for better query performance
notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ user: 1, isRead: 1 })

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
