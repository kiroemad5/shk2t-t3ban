const logger = require('../utils/logger')
const Inquiry = require('../models/inquiry.model')
const CreateError = require('http-errors')
const APIFeatures = require('../utils/apiFeatures')
const { roles } = require('../types/user.enum')
const {
  createNotificationServices,
  createNotificationWithSession
} = require('./notification.services')
const { notificationType } = require('../types/notification.enum')
const { default: mongoose } = require('mongoose')

exports.createInquiryServices = async (req, res) => {
  logger.info('Creating new inquiry', {
    email: req.body.email,
    lang: req.getLocale()
  })
  // Attach user and uploaded images
  const files = Array.isArray(req.files) ? req.files : []
  const nameFromUser = [req.user?.firstName, req.user?.lastName]
    .filter(Boolean)
    .join(' ')

  req.body.userId = req.user && req.user._id
  req.body.name = nameFromUser || req.body.name
  req.body.phoneNumber = req.user?.phoneNumber || req.body.phoneNumber
  req.body.email = req.user?.email || req.body.email
  req.body.imageList = files.map((f) => f.path)
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const [inquiry] = await Inquiry.create([req.body], { session })

    const notificationData = {
      title: `hi there`,
      message: `you have new message to review`,
      userType: roles.Operation,
      type: notificationType.Info
    }
    await createNotificationWithSession(notificationData, session)

    await session.commitTransaction()
    return {
      status: 'success',
      message: req.__('inquiry.created_successfully'),
      inquiry
    }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}
exports.getAllInquiriesServices = async (req, res) => {
  logger.info('Getting all inquiries', {
    lang: req.getLocale()
  })

  // Scope base query by role
  let baseQuery = Inquiry.find()
  if (req.user.role === roles.User) {
    baseQuery = Inquiry.find({ userId: req.user._id })
  } else if (req.user.role === roles.Operation) {
    // Operations see active inquiries OR inquiries where they're the accepted org
    baseQuery = Inquiry.find({
      $or: [
        { status: 'active' },
        { status: { $in: ['accepted', 'ended'] }, 'reply.organizationId': req.user.organizationId }
      ]
    })
  }

  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  let inquiries = await features.query
  const total = await Inquiry.countDocuments(
    req.user.role === roles.User ? { userId: req.user._id } : {}
  )

  // Filter based on user role
  if (req.user.role === roles.Operation) {
    // Operations see all inquiries but with limited info
    inquiries = inquiries.map((inq) => {
      const inquiry = inq.toObject()
      const userOrgId = req.user.organizationId

      const replies = Array.isArray(inquiry.reply) ? inquiry.reply : []
      // Check if user accepted this operation's reply
      const acceptedReply = replies.find(
        (r) =>
          inquiry.acceptedReplyId &&
          r._id &&
          r._id.toString() === inquiry.acceptedReplyId.toString()
      )
      const isAcceptedOrg = acceptedReply?.organizationId === userOrgId

      // Hide user contact details unless this org's reply was accepted
      if (!isAcceptedOrg) {
        delete inquiry.name
        delete inquiry.email
        delete inquiry.phoneNumber
        delete inquiry.userId
      }

      // Filter replies - show only this organization's replies
      inquiry.reply = replies.filter((r) => r.organizationId === userOrgId)

      return inquiry
    })
  }

  return {
    status: 'success',
    message: req.__('inquiry.inquiries_retrieved_successfully'),
    length: total,
    inquiries
  }
}

exports.updateInquiryServices = async (req, res) => {
  logger.info('Updating inquiry', {
    inquiryId: req.params.id,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }

  // Only owner (user) or admin can edit; and only if not accepted
  const isOwner = inquiry.userId.toString() === req.user._id.toString()
  const isAdmin = req.user.role === roles.Admin
  if (!isOwner && !isAdmin) {
    throw CreateError(403, req.__('inquiry.not_authorized'))
  }
  if (inquiry.status !== 'active' && !isAdmin) {
    throw CreateError(400, req.__('inquiry.cannot_edit_after_accept'))
  }

  const files = Array.isArray(req.files) ? req.files : []
  const updatePayload = {
    ...req.body,
    ...(files.length ? { imageList: files.map((f) => f.path) } : {})
  }

  const updated = await Inquiry.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true
  })

  return {
    status: 'success',
    message: req.__('inquiry.inquiry_updated_successfully'),
    data: updated
  }
}

exports.updateReplyToInquiryServices = async (req, res) => {
  logger.info('Updating reply to inquiry', {
    inquiryId: req.params.id,
    replyId: req.params.replyId,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }
  if (inquiry.status !== 'active') {
    throw CreateError(400, req.__('inquiry.cannot_edit_reply_after_accept'))
  }

  const reply = (inquiry.reply || []).find((r) => r._id.toString() === req.params.replyId)
  if (!reply) {
    throw CreateError(404, req.__('inquiry.reply_not_found'))
  }

  const isAdmin = req.user.role === roles.Admin
  const sameOrg = reply.organizationId === req.user.organizationId
  if (!sameOrg && !isAdmin) {
    throw CreateError(403, req.__('inquiry.not_authorized'))
  }
  if (reply.status !== 'pending' && !isAdmin) {
    throw CreateError(400, req.__('inquiry.only_pending_reply_editable'))
  }

  reply.text = req.body.text
  await inquiry.save()

  return {
    status: 'success',
    message: req.__('inquiry.reply_updated_successfully'),
    reply
  }
}

exports.deleteInquiryServices = async (req, res) => {
  logger.info('Deleting inquiry', {
    inquiryId: req.params.id,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }

  const isOwner = inquiry.userId.toString() === req.user._id.toString()
  const isAdmin = req.user.role === roles.Admin
  if (!isOwner && !isAdmin) {
    throw CreateError(403, req.__('inquiry.not_authorized'))
  }
  if (inquiry.status !== 'active' && !isAdmin) {
    throw CreateError(400, req.__('inquiry.cannot_delete_after_accept'))
  }

  await Inquiry.findByIdAndDelete(req.params.id)
  return {
    status: 'success',
    message: req.__('inquiry.inquiry_deleted_successfully')
  }
}

exports.deleteReplyFromInquiryServices = async (req, res) => {
  logger.info('Deleting reply from inquiry', {
    inquiryId: req.params.id,
    replyId: req.params.replyId,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }

  const reply = (inquiry.reply || []).find((r) => r._id.toString() === req.params.replyId)
  if (!reply) {
    throw CreateError(404, req.__('inquiry.reply_not_found'))
  }

  const isAdmin = req.user.role === roles.Admin
  const sameOrg = reply.organizationId === req.user.organizationId
  if (!sameOrg && !isAdmin) {
    throw CreateError(403, req.__('inquiry.not_authorized'))
  }
  if (reply.status === 'accepted' && !isAdmin) {
    throw CreateError(400, req.__('inquiry.cannot_delete_accepted_reply'))
  }

  inquiry.reply = (inquiry.reply || []).filter((r) => r._id.toString() !== req.params.replyId)
  await inquiry.save()

  return {
    status: 'success',
    message: req.__('inquiry.reply_deleted_successfully')
  }
}

exports.rejectAcceptedReplyServices = async (req, res) => {
  logger.info('Rejecting accepted reply', {
    inquiryId: req.params.id,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }

  // Only the user who owns the inquiry can reject
  if (inquiry.userId.toString() !== req.user._id.toString()) {
    throw CreateError(403, req.__('inquiry.not_authorized'))
  }

  if (inquiry.status !== 'accepted') {
    throw CreateError(400, req.__('inquiry.no_accepted_reply_to_reject'))
  }

  // Restore all replies to pending
  inquiry.reply.forEach((r) => {
    if (r.status === 'accepted' || r.status === 'rejected') {
      r.status = 'pending'
    }
  })

  inquiry.acceptedReplyId = null
  inquiry.status = 'active'
  await inquiry.save()

  return {
    status: 'success',
    message: req.__('inquiry.reply_rejected_successfully'),
    inquiry
  }
}

exports.endInquiryServices = async (req, res) => {
  logger.info('Ending inquiry', {
    inquiryId: req.params.id,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }

  // Only the user who owns the inquiry can end it
  if (inquiry.userId.toString() !== req.user._id.toString()) {
    throw CreateError(403, req.__('inquiry.not_authorized'))
  }

  if (inquiry.status !== 'accepted') {
    throw CreateError(400, req.__('inquiry.must_accept_reply_before_ending'))
  }

  inquiry.status = 'ended'
  await inquiry.save()

  return {
    status: 'success',
    message: req.__('inquiry.inquiry_ended_successfully'),
    inquiry
  }
}

exports.addReplyToInquiryServices = async (req, res) => {
  logger.info('Adding reply to inquiry', {
    inquiryId: req.params.id,
    organizationId: req.user.organizationId,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }

  // Check if this organization already replied
  const existingReply = inquiry.reply.find(
    (r) => r.organizationId === req.user.organizationId
  )
  if (existingReply) {
    throw CreateError(400, req.__('inquiry.organization_already_replied'))
  }

  const newReply = {
    organizationId: req.user.organizationId,
    createdBy: req.user._id,
    text: req.body.text,
    status: 'pending',
    createdAt: new Date()
  }

  inquiry.reply.push(newReply)
  await inquiry.save()

  // Notify user about new reply
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const notificationData = {
      userID: inquiry.userId,
      title: req.__('inquiry.new_reply_title'),
      message: req.__('inquiry.new_reply_message'),
      userType: roles.User,
      type: notificationType.Info
    }
    await createNotificationWithSession(notificationData, session)
    await session.commitTransaction()
  } catch (err) {
    await session.abortTransaction()
  } finally {
    session.endSession()
  }

  return {
    status: 'success',
    message: req.__('inquiry.reply_added_successfully'),
    reply: newReply
  }
}

exports.acceptReplyServices = async (req, res) => {
  logger.info('Accepting inquiry reply', {
    inquiryId: req.params.id,
    replyId: req.body.replyId,
    lang: req.getLocale()
  })

  const inquiry = await Inquiry.findById(req.params.id)
  if (!inquiry) {
    throw CreateError(404, req.__('inquiry.inquiry_not_found'))
  }

  // Verify this inquiry belongs to the requesting user
  if (inquiry.userId.toString() !== req.user._id.toString()) {
    throw CreateError(403, req.__('inquiry.not_authorized'))
  }

  // Find the reply
  const replyToAccept = inquiry.reply.find(
    (r) => r._id.toString() === req.body.replyId
  )
  if (!replyToAccept) {
    throw CreateError(404, req.__('inquiry.reply_not_found'))
  }

  // Update reply statuses
  inquiry.reply.forEach((r) => {
    if (r._id.toString() === req.body.replyId) {
      r.status = 'accepted'
    } else if (r.status === 'pending') {
      r.status = 'rejected'
    }
  })

  inquiry.acceptedReplyId = replyToAccept._id
  inquiry.status = 'accepted'
  await inquiry.save()

  // Notify the accepted organization
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const notificationData = {
      title: req.__('inquiry.reply_accepted_title'),
      message: req.__('inquiry.reply_accepted_message'),
      userType: roles.Operation,
      type: notificationType.Info
    }
    await createNotificationWithSession(notificationData, session)
    await session.commitTransaction()
  } catch (err) {
    await session.abortTransaction()
  } finally {
    session.endSession()
  }

  return {
    status: 'success',
    message: req.__('inquiry.reply_accepted_successfully'),
    inquiry
  }
}
