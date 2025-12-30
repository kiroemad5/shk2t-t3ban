const {
  addCartItemService,
  getCartItemsService,
  updateCartItemService,
  deleteCartItemService
} = require('../services/cartItem.services')


exports.addCartItemController = async (req, res, next) => {
  try {
    const result = await addCartItemService(req)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}


// exports.getCartItemsController = async (req, res, next) => {
//   try {
//     const result = await getCartItemsService(req)
//     res.status(200).json(result)
//   } catch (err) {
//     next(err)
//   }
// }


exports.updateCartItemController = async (req, res, next) => {
  try {
    const result = await updateCartItemService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}


exports.deleteCartItemController = async (req, res, next) => {
  try {
    const result = await deleteCartItemService(req)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
