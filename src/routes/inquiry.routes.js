const express = require('express')
const router = express.Router()

const {
  createInquiryController,
  getAllInquiriesController,
  updateInquiryController,
  addReplyToInquiryController,
  acceptReplyController,
  updateReplyController,
  deleteInquiryController,
  deleteReplyController,
  rejectAcceptedReplyController,
  endInquiryController
} = require('../controllers/inquiry.controller')

const {
  createInquirySchema,
  replyInquirySchema,
  addReplySchema,
  acceptReplySchema,
  updateInquirySchema
} = require('../schemas/inquiry.schema')

const validateBodyMiddleware = require('../middlewares/validateBody.middleware')
const { protect } = require('../middlewares/protect.middleware')
const { restrictTo } = require('../middlewares/restrictTo.middleware')
const { roles } = require('../types/user.enum')
const uploadMiddleware = require('../middlewares/uploadFiles')

// Public routes (no authentication required)
router.post(
  '/',
  protect,
  uploadMiddleware.array('image', 5),
  validateBodyMiddleware(createInquirySchema),
  createInquiryController
)

// Protected routes (admin only)
router.use(protect)
// router.use(restrictTo(roles.Operation, roles.Admin))

router.get('/', getAllInquiriesController)

// Users can edit their inquiry if not accepted
router.patch(
  '/:id',
  restrictTo(roles.User, roles.Admin),
  uploadMiddleware.array('image', 5),
  validateBodyMiddleware(updateInquirySchema),
  updateInquiryController
)

// Operations can add replies to inquiries
router.post(
  '/:id/reply',
  restrictTo(roles.Operation, roles.Admin),
  validateBodyMiddleware(addReplySchema),
  addReplyToInquiryController
)

// Operations can edit their reply if pending and not accepted
router.patch(
  '/:id/replies/:replyId',
  restrictTo(roles.Operation, roles.Admin),
  validateBodyMiddleware(addReplySchema),
  updateReplyController
)

// Users can accept a reply offer
router.post(
  '/:id/accept-reply',
  restrictTo(roles.User),
  validateBodyMiddleware(acceptReplySchema),
  acceptReplyController
)

// Users can reject an accepted reply (restore to active)
router.post(
  '/:id/reject-reply',
  restrictTo(roles.User),
  rejectAcceptedReplyController
)

// Users can end/close inquiry (only visible to user + accepted org)
router.post(
  '/:id/end',
  restrictTo(roles.User),
  endInquiryController
)

// Delete inquiry (user owns or admin)
router.delete(
  '/:id',
  restrictTo(roles.User, roles.Admin),
  deleteInquiryController
)

// Delete reply (operation owns or admin)
router.delete(
  '/:id/replies/:replyId',
  restrictTo(roles.Operation, roles.Admin),
  deleteReplyController
)

module.exports = router
