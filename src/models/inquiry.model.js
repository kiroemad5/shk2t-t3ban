const mongoose = require('mongoose')
const validator = require('validator')

/**
 * Inquiry Model
 * Stores customer inquiries with contact details, descriptions, and replies from different organizations
 */
const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Inquiry.Inquiry name is required'],
      trim: true,
      minlength: [2, 'Inquiry.Name must be at least 2 characters long'],
      maxlength: [100, 'Inquiry.Name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Inquiry.Inquiry description is required'],
      trim: true,
      minlength: [10, 'Inquiry.escription must be at least 10 characters long'],
      maxlength: [1000, 'Inquiry.Description cannot exceed 1000 characters']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Inquiry.Phone number is required'],
      validate: {
        validator: function (val) {
          return /^(\+2)?01[0-2,5][0-9]{8}$/.test(val)
        },
        message: 'Please provide a valid phone number'
      }
    },
    email: {
      type: String,
      required: [true, 'Inquiry.Email is required'],
      lowercase: true,
      trim: true,
      validate: [
        validator.isEmail,
        'Inquiry.Please provide a valid email address'
      ]
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    imageList: {
      type: [String],
      validate: {
        validator: (arr) => !arr || arr.length <= 5,
        message: 'inquiry.imageList cannot exceed 5 items'
      },
      default: []
    },
    reply: {
      type: [
        {
          /**
           * Organization ID of the admin/operation who replied
           * Allows different organizations to send replies to the same inquiry
           */
          organizationId: {
            type: String,
            required: true
          },
          /**
           * User ID of the operation who created this reply
           */
          createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
          },
          /**
           * Reply text content
           * The actual response message/offer to the inquiry
           */
          text: {
            type: String,
            required: [true, 'reply.text is required'],
            trim: true,
            minlength: [5, 'reply.text must be at least 5 characters'],
            maxlength: [2000, 'reply.text cannot exceed 2000 characters']
          },
          /**
           * Status of this reply
           * pending: awaiting user decision
           * accepted: user chose this reply
           * rejected: user declined this reply
           */
          status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
          },
          /**
           * Timestamp when this reply was created
           * Automatically set to current time
           */
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    },
    /**
     * ID of the accepted reply (if any)
     * Once user accepts a reply, only that organization can see full user details
     */
    acceptedReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    /**
     * Status of the inquiry
     * active: inquiry is open for replies
     * accepted: user accepted a reply
     * ended: inquiry is closed, only visible to user and accepted org
     */
    status: {
      type: String,
      enum: ['active', 'accepted', 'ended'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

inquirySchema.index({ email: 1, createdAt: -1 })
inquirySchema.index({ status: 1, createdAt: -1 })

const Inquiry = mongoose.model('Inquiry', inquirySchema)

module.exports = Inquiry
