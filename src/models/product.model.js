const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    imageList: {
      type: [String],
      validate: {
        validator: (arr) => !arr || arr.length <= 5,
        message: 'imageList cannot exceed 5 items'
      },
      default: []
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    PurchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    stockQty: {
      type: Number,
      default: 0,
      min: 0
    },
    organizationId: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    advProduct: {
      type: [String],
      default: []
    },
    qualityGrade: {
      type: String,
      enum: ['first', 'second', 'third', 'fourth'],
      trim: true
    },
    color: {
      type: String,
      trim: true
    },

    averageRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
// بالمتر المكعب كده كده 
)
productSchema.index({ organizationId: 1 })
productSchema.virtual('productReview', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId'
})

// productSchema.pre('validate', function (next) {
//   if (Array.isArray(this.imageList) && this.imageList.length > 5) {
//     this.imageList = this.imageList.slice(0, 5)
//   }
//   next()
// })

// Method to get review summary
productSchema.methods.getReviewSummary = async function () {
  const Review = mongoose.model('Review')

  const summary = await Review.aggregate([
    { $match: { productId: this._id } },
    {
      $group: {
        _id: null,
        averageRate: { $avg: '$rateNum' },
        totalReviews: { $sum: 1 },
        rateDistribution: {
          $push: '$rateNum'
        }
      }
    },
    {
      $project: {
        _id: 0,
        averageRate: { $round: ['$averageRate', 2] },
        totalReviews: 1,
        rateDistribution: {
          5: {
            $size: {
              $filter: {
                input: '$rateDistribution',
                cond: { $eq: ['$$this', 5] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: '$rateDistribution',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: '$rateDistribution',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: '$rateDistribution',
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          1: {
            $size: {
              $filter: {
                input: '$rateDistribution',
                cond: { $eq: ['$$this', 1] }
              }
            }
          }
        }
      }
    }
  ])
  if (summary[0]?.rateDistribution[0])
    summary[0].rateDistribution = summary[0].rateDistribution[0]
  return (
    summary[0] || {
      averageRate: 0,
      totalReviews: 0,
      rateDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }
  )
}

const Product = mongoose.model('Product', productSchema)
module.exports = Product
