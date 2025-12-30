const express = require('express')
const router = express.Router()

const {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  filterProducts,
  getAllCategoriesController,
  getProductsByOrganizationController,
  getProductsByCategoryController,
  getMyOrganizationProductsController
} = require('../controllers/product.controller.js')

const {
  createProductSchema,
  updateProductSchema
} = require('../schemas/product.schemas.js')
const validateBodyMiddleware = require('../middlewares/validateBody.middleware')
const { protect } = require('../middlewares/protect.middleware.js')
const { restrictTo } = require('../middlewares/restrictTo.middleware.js')
const uploadMiddleware = require('../middlewares/uploadFiles.js')
const { roles } = require('../types/user.enum.js')

// router.get('/filter', filterProducts)

router.post(
  '/',
  protect,
  restrictTo(roles.Operation, roles.Admin),
  uploadMiddleware.array('image', 5),
  validateBodyMiddleware(createProductSchema),
  createProductController
)
router.get('/', getAllProductsController)

router.get('/categories', getAllCategoriesController)

// Get my organization products (operations only, requires auth)
router.get(
  '/my-organization',
  protect,
  restrictTo(roles.Operation, roles.Admin),
  getMyOrganizationProductsController
)

// Get products by organization
router.get('/organization/:organizationId', getProductsByOrganizationController)

// Get products by category
router.get('/category/:category', getProductsByCategoryController)

router.get('/:id', getProductByIdController)
router.put(
  '/:id',
  protect,
  restrictTo(roles.Admin, roles.Operation),
  uploadMiddleware.array('image', 5),
  validateBodyMiddleware(updateProductSchema),
  updateProductController
)

router.delete(
  '/:id',
  protect,
  restrictTo(roles.Admin, roles.Operation),
  deleteProductController
)
module.exports = router
