const { v4 } = require('uuid')
const Payment = require('../models/payment.model')
const Product = require('../models/product.model')
const Review = require('../models/review.model')
const {
  paymentType,
  paymentWay,
  paymentStatus
} = require('../types/payment.enum')
const APIFeatures = require('../utils/apiFeatures')
const logger = require('../utils/logger')
const CreateError = require('http-errors')
const { default: mongoose } = require('mongoose')

exports.createProductService = async (req, res) => {
  logger.info('POST /app/v1/product endpoint called', {
    lang: req.getLocale()
  })

  if (req.files && req.files.length > 5) {
    throw CreateError(400, req.__('product.images_limit_exceeded'))
  }
  const files = Array.isArray(req.files) ? req.files : []
  let createProduct = req.body || {}
  // Start with any imageList sent in the body (e.g., URLs), then append uploaded files
  createProduct.imageList = Array.isArray(createProduct.imageList)
    ? createProduct.imageList
    : []

  // Attach organization and creator from authenticated user
  createProduct.organizationId =
    req.user?.organizationId || req.orgId || process.env.DEFAULT_ORGANIZATION_ID
  createProduct.createdBy = req.user && req.user._id

  files.forEach((file) => {
    createProduct.imageList.push(file.path)
  })

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    // createProduct.imageList = imageList
    const [product] = await Product.create([createProduct], { session })
    await Payment.create(
      [
        {
          userId: product._id,
          orderId: v4().replace(/-/g, '').substring(0, 16).toUpperCase(),
          totalPrice: product.PurchasePrice * product.stockQty,
          type: paymentType.Expenses,
          paymentWay: paymentWay.Cash,
          paymentStatus: paymentStatus.Paid
        }
      ],
      { session }
    )
    await session.commitTransaction()

    return {
      status: 'success',
      message: req.__('product.created_successfully'),
      product
    }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}

exports.getAllProductsService = async (req, res) => {
  logger.info('GET /app/v1/product endpoint called', {
    lang: req.getLocale()
  })

  let category = req.query.category
  const orgFilter = req.query.organizationId

  // Base query
  let baseQuery = Product.find()

  // If operation, limit to their organization
  if (req.user && req.user.role === 'operation') {
    baseQuery = baseQuery.where('organizationId').equals(req.user.organizationId)
  }

  // If explicit organizationId filter provided (admin or public)
  if (orgFilter) {
    baseQuery = baseQuery.where('organizationId').equals(orgFilter)
  }

  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  // Category filter (supports comma-separated list)
  if (category && typeof category === 'string') {
    const categories = category.includes(',')
      ? category.split(',').map((c) => c.trim())
      : [category]
    features.query.where('category').in(categories)
  }

  const products = await features.query.populate({
    path: 'productReview',
    options: { limit: 10 }
  })

  const totalProducts = await Product.countDocuments(
    features.query.getQuery ? features.query.getQuery() : {}
  )

  return {
    status: 'success',
    length: totalProducts,
    data: products
  }
}

exports.getProductByIdService = async (req, res) => {
  logger.info(`GET /app/v1/product/${req.params.id} endpoint called`, {
    lang: req.getLocale()
  })

  const product = await Product.findById(req.params.id).populate({
    path: 'productReview',
    options: { limit: 10 }
  })
  if (!product) {
    throw CreateError(404, req.__('product.not_found'))
  }

  const summary = await product.getReviewSummary()
  return {
    status: 'success',
    product: {
      ...product.toObject(),
      reviewSummary: summary
    }
  }
}

exports.updateProductService = async (req, res) => {
  logger.info(`PUT /app/v1/product/${req.params.id} endpoint called`, {
    lang: req.getLocale()
  })

  if (req.files && req.files.length > 5) {
    throw CreateError(400, req.__('product.images_limit_exceeded'))
  }

  // Get the product first to work with existing images
  const existingProduct = await Product.findById(req.params.id)
  if (!existingProduct) {
    throw CreateError(404, req.__('product.not_found'))
  }

  // Operations can only edit their own organization products
  if (
    req.user.role === 'operation' &&
    existingProduct.organizationId?.toString() !== req.user.organizationId
  ) {
    throw CreateError(403, req.__('product.not_authorized'))
  }

  let ProductUpdated = { ...req.body }
  // console.log('ProductUpdated ', ProductUpdated)

  // Handle image deletion
  if (req.body.Deleteimage) {
    const imagesToDelete = req.body.Deleteimage.split(',').map((img) =>
      img.trim()
    )
    ProductUpdated.imageList = existingProduct.imageList.filter(
      (img) => !imagesToDelete.includes(img)
    )
  } else {
    // Keep existing images if no deletion specified
    ProductUpdated.imageList = existingProduct.imageList
  }

  // Add new uploaded images
  if (req.files && req.files.length > 0) {
    req.files.forEach((file) => {
      ProductUpdated.imageList.push(file.path)
    })
  }

  // Remove Deleteimage from the update object
  delete ProductUpdated.Deleteimage
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      ProductUpdated,
      {
        new: true,
        runValidators: true,
        session
      }
    )

    let totalPrice = 0
    if (product.stockQty > existingProduct.stockQty) {
      totalPrice =
        product.PurchasePrice * (product.stockQty - existingProduct.stockQty)
      await Payment.create(
        [
          {
            userId: product._id,
            orderId: v4().replace(/-/g, '').substring(0, 16).toUpperCase(),
            totalPrice,
            type: paymentType.Expenses,
            paymentWay: paymentWay.Cash,
            paymentStatus: paymentStatus.Paid
          }
        ],
        { session }
      )
    } else if (product.stockQty < existingProduct.stockQty) {
      // totalPrice = existingProduct.PurchasePrice * product.stockQty

      totalPrice =
        existingProduct.PurchasePrice *
        (product.stockQty - existingProduct.stockQty)
      await Payment.create(
        [
          {
            userId: product._id,
            orderId: v4().replace(/-/g, '').substring(0, 16).toUpperCase(),
            totalPrice,
            type: paymentType.Expenses,
            paymentWay: paymentWay.Cash,
            paymentStatus: paymentStatus.Paid
          }
        ],
        { session }
      )
    } else if (req.body?.PurchasePrice) {
      const payment = await Payment.findOne({
        userId: product._id
        // totalPrice: existingProduct.PurchasePrice * existingProduct.stockQty
      }).sort({ updatedAt: -1 })
      const stockQty = payment.totalPrice / existingProduct.PurchasePrice
      payment.totalPrice = stockQty * product.PurchasePrice
      await payment.save({ session })
    }

    await session.commitTransaction()

    return {
      status: 'success',
      message: req.__('product.updated_successfully'),
      product
    }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}

exports.deleteProductService = async (req, res) => {
  logger.info(`DELETE /app/v1/product/${req.params.id} endpoint called`, {
    lang: req.getLocale()
  })
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      throw CreateError(404, req.__('product.not_found'))
    }

    if (
      req.user.role === 'operation' &&
      product.organizationId?.toString() !== req.user.organizationId
    ) {
      throw CreateError(403, req.__('product.not_authorized'))
    }

    await Product.findByIdAndDelete(req.params.id, { session })

    if (!product) {
      throw CreateError(404, req.__('product.not_found'))
    }
    await Payment.create(
      [
        {
          userId: product._id,
          orderId: v4().replace(/-/g, '').substring(0, 16).toUpperCase(),
          totalPrice: -product.PurchasePrice * product.stockQty,
          type: paymentType.Expenses,
          paymentWay: paymentWay.Cash,
          paymentStatus: paymentStatus.Paid
        }
      ],
      { session }
    )

    await session.commitTransaction()

    return {
      status: 'success',
      message: req.__('product.deleted_successfully')
    }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}

exports.getAllCategoriesService = async (req, res, next) => {
  logger.info('GET /app/v1/product/categories endpoint called', {
    lang: req.getLocale()
  })

  const categories = await Product.distinct('category')
  return {
    status: 'success',
    length: categories.length,
    data: categories || []
  }
}

exports.getMyOrganizationProductsService = async (req, res) => {
  logger.info('GET /app/v1/products/my-organization endpoint called', {
    organizationId: req.user.organizationId,
    lang: req.getLocale()
  })

  if (!req.user || !req.user.organizationId) {
    throw CreateError(403, req.__('product.organization_required'))
  }

  const baseQuery = Product.find().where('organizationId').equals(req.user.organizationId)

  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const products = await features.query.populate({
    path: 'productReview',
    options: { limit: 10 }
  })

  const totalProducts = await Product.countDocuments({ 
    organizationId: req.user.organizationId 
  })

  return {
    status: 'success',
    organizationId: req.user.organizationId,
    length: totalProducts,
    data: products
  }
}
