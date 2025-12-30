const {
  UpdatePasswordServices,
  addAddressServices,
  updateAddressServices,
  deleteAddressServices,
  getUserServices,
  updateUserServices,
  createoperationServices,
  showPasswordServices,
  getAllOperationServices,
  getCustomersStatisticsServices,
  getOperationsStatisticsServices,
  updateOperationServices
} = require('../services/user.services')

const UpdatePasswordCotroller = async (req, res, next) => {
  try {
    const result = await UpdatePasswordServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getUserController = async (req, res, next) => {
  try {
    const result = await getUserServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const updateUserController = async (req, res, next) => {
  try {
    const result = await updateUserServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const addAddressController = async (req, res, next) => {
  try {
    const result = await addAddressServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const updateAddressController = async (req, res, next) => {
  try {
    const result = await updateAddressServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteAddressController = async (req, res, next) => {
  try {
    const result = await deleteAddressServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const CreateOperationCotroller = async (req, res, next) => {
  try {
    const result = await createoperationServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
const updateOperationController = async (req, res, next) => {
  try {
    const result = await updateOperationServices(req, res)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
const showPasswordCotroller = async (req, res, next) => {
  try {
    const result = await showPasswordServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getAllOperationCotroller = async (req, res, next) => {
  try {
    const result = await getAllOperationServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getCustomersStatisticsCotroller = async (req, res, next) => {
  try {
    const result = await getCustomersStatisticsServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

const getOperationsStatisticsCotroller = async (req, res, next) => {
  try {
    const result = await getOperationsStatisticsServices(req)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  UpdatePasswordCotroller,
  getUserController,
  updateUserController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  CreateOperationCotroller,
  updateOperationController,
  showPasswordCotroller,
  getAllOperationCotroller,
  getCustomersStatisticsCotroller,
  getOperationsStatisticsCotroller
}
