const WishItem = require('../models/wishItem.model')
const APIFeatures = require('../utils/apiFeatures')
const logger = require('../utils/logger')
const CreateError = require('http-errors')

exports.createWishItemService = async (req, res) => {
  logger.info('POST /app/v1/wish endpoint called', { lang: req.getLocale() })

  try {
    const wishItem = await WishItem.create({
      userId: req.user.id,
      productId: req.body.productId
    })

    return {
      status: 'success',
      message: req.__('wish_item.added_successfully'),
      data: { wishItem }
    }
  } catch (error) {
    if ((error && error.code === 11000) || error?.message?.includes('E11000')) {
      throw CreateError(409, req.__('wish_item.already_exists'))
    }
    throw error
  }
}

exports.getWishItemsService = async (req) => {
  logger.info('GET /app/v1/wish endpoint called', { lang: req.getLocale() })

  const features = new APIFeatures(
    WishItem.find({ userId: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const wishItems = await features.query.populate('productId')
  const total = await WishItem.countDocuments({ userId: req.user.id })
  // const wishItems = await WishItem.find({ userId: req.user.id }).populate(
  //   'productId'
  // )

  return {
    status: 'success',
    data: { count: total, wishItems }
  }
}

exports.deleteWishItemService = async (req) => {
  logger.info(`DELETE /app/v1/wish/:productId endpoint called`, {
    lang: req.getLocale(),
    user: req.user.id,
    productId: req.params.productId
  })

  const userId = req.user.id
  const { productId } = req.params

  const wishItem = await WishItem.findOneAndDelete({ userId, productId })

  if (!wishItem) {
    throw CreateError(404, req.__('wish_item.not_found'))
  }

  return {
    status: 'success',
    message: req.__('wish_item.deleted_successfully')
  }
}
