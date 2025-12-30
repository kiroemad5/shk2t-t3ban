const Joi = require('joi')


const addCartItemSchema = Joi.object({
  productId: Joi.string().required(),
  itemQty: Joi.number().integer().min(1).required()
})


const updateCartItemSchema = Joi.object({
  itemQty: Joi.number().integer().min(1).required()
})

module.exports = {
  addCartItemSchema,
  updateCartItemSchema
}
