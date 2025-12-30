const {
  createWishItemService,
  getWishItemsService,
  deleteWishItemService
} = require('../services/wishItem.services')

exports.createWishItem = async (req, res, next) => {
  try {
    const result = await createWishItemService(req)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

exports.getWishItems = async (req, res, next) => {
  try {
    const result = await getWishItemsService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

exports.deleteWishItem = async (req, res, next) => {
  try {
    const result = await deleteWishItemService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
