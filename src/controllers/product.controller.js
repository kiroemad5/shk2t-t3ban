const {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  getAllCategoriesService,
  filterProductsService,
  getMyOrganizationProductsService
} = require('../services/product.services')

const createProductController = async (req, res, next) => {
  try {
    const result = await createProductService(req, res)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const getAllProductsController = async (req, res, next) => {
  try {
    const result = await getAllProductsService(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getProductsByOrganizationController = async (req, res, next) => {
  try {
    // reuse service with organizationId query param
    req.query.organizationId = req.params.organizationId
    const result = await getAllProductsService(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getProductsByCategoryController = async (req, res, next) => {
  try {
    req.query.category = req.params.category
    const result = await getAllProductsService(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getProductByIdController = async (req, res, next) => {
  try {
    const result = await getProductByIdService(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const updateProductController = async (req, res, next) => {
  try {
    const result = await updateProductService(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteProductController = async (req, res, next) => {
  try {
    const result = await deleteProductService(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getAllCategoriesController=async(req,res,next)=>{
  try{
   const result = await getAllCategoriesService(req, res)
   res.status(200).json(result)
  }catch(error){
     next(error)
  }
}

const filterProducts = async (req, res, next) => {
  try {
    const result = await filterProductsService(req.query)

    return res.status(200).json({
      status: 'success',
      message: req.__('product.filtered_successfully'),
      ...result
    })
  } catch (err) {
    next(err)
  }
}

const getMyOrganizationProductsController = async (req, res, next) => {
  try {
    const result = await getMyOrganizationProductsService(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getAllCategoriesController,
  filterProducts,
  getProductsByOrganizationController,
  getProductsByCategoryController,
  getMyOrganizationProductsController
}
