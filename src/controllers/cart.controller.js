const {
  createCartService,
  getCartService,
  clearCartService,
  deleteCartService
} = require('../services/cart.services')


exports.createCartController = async (req, res, next) => {
  try {
    const result = await createCartService(req)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}


exports.getCartController = async (req, res, next) => {
  try {
    const result = await getCartService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}


exports.clearCartController = async (req, res, next) => {
  try {
    const result = await clearCartService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}


exports.deleteCartController = async (req, res, next) => {
  try {
    const result = await deleteCartService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
