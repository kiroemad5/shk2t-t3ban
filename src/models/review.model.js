const mongoose = require('mongoose')

const { updateProductAverageRate } = require('../utils/updateAverageRate')

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    rateNum: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    reply: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true })

reviewSchema.post('save', async function () {
  await updateProductAverageRate(this.productId)
})

reviewSchema.post('remove', async function () {
  await updateProductAverageRate(this.productId)
})

reviewSchema.post(
  ['findOneAndUpdate', 'findOneAndDelete'],
  async function (doc) {
    if (doc) {
      await updateProductAverageRate(doc.productId)
    }
  }
)

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
