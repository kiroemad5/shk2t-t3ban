const express = require('express')
const router = express.Router()
const {
  signupCotroller,
  signWithsocialCotroller,
  loginCotroller,
  ConfirmOTPCotroller,
  forgetPasswordCotroller,
  OTPResendCotroller,
  resetPasswordCotroller
} = require('../controllers/auth.controller.js')
const validateBodyMiddleware = require('../middlewares/validateBody.middleware.js')
const {
  NormalSignupSchema,
  socialSchema,
  loginSchema,
  ConfirmOTPSchema,
  forgetPasswordSchema,
  OTPResendSchema,
  resetPasswordSchema
} = require('../schemas/auth.schemas.js')
const { protect } = require('../middlewares/protect.middleware.js')
const {
  UpdatePasswordSchema,
  AddressSchema,
  UpdateAddressSchema,
  DeleteAddressSchema,
  updateUserSchema,
  createOperationSchema,
  showPasswordSchema,
  updateOperationSchema
} = require('../schemas/user.schema.js')
const {
  UpdatePasswordCotroller,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  getUserController,
  updateUserController,
  CreateOperationCotroller,
  showPasswordCotroller,
  getAllOperationCotroller,
  getCustomersStatisticsCotroller,
  getOperationsStatisticsCotroller,
  updateOperationController
} = require('../controllers/user.controller.js')
const uploadMiddleware = require('../middlewares/uploadFiles.js')
const { restrictTo } = require('../middlewares/restrictTo.middleware.js')
const { roles } = require('../types/user.enum.js')
const validateQueryMiddleware = require('../middlewares/validateQuery.middleware.js')

router.post(
  '/signup',
  validateBodyMiddleware(NormalSignupSchema),
  signupCotroller
)

// router.post(
//   '/signupAdmin',
//   validateBodyMiddleware(NormalSignupSchema),
//   signupAdminCotroller
// )

router.post('/login', validateBodyMiddleware(loginSchema), loginCotroller)

router.post(
  '/signWithSocial',
  validateBodyMiddleware(socialSchema),
  signWithsocialCotroller
)

router.patch(
  '/OTPVerification',
  validateBodyMiddleware(ConfirmOTPSchema),
  ConfirmOTPCotroller
)

router.post(
  '/forgetPassword',
  validateBodyMiddleware(forgetPasswordSchema),
  forgetPasswordCotroller
)

router.patch(
  '/ResetPassword',
  validateBodyMiddleware(resetPasswordSchema),
  resetPasswordCotroller
)

router.post(
  '/OTPResend',
  validateBodyMiddleware(OTPResendSchema),
  OTPResendCotroller
)

router.patch(
  '/updatePassword',
  protect,
  validateBodyMiddleware(UpdatePasswordSchema),
  UpdatePasswordCotroller
)

router
  .route('/user')
  .get(protect, getUserController)
  .patch(
    protect,
    uploadMiddleware.fields([{ name: 'image', maxCount: 1 }]),
    validateBodyMiddleware(updateUserSchema),
    updateUserController
  )

router
  .route('/address')
  .post(protect, validateBodyMiddleware(AddressSchema), addAddressController)
  .patch(
    protect,
    validateBodyMiddleware(UpdateAddressSchema),
    updateAddressController
  )
  .delete(
    protect,
    validateBodyMiddleware(DeleteAddressSchema),
    deleteAddressController
  )
router.post(
  '/createOperation',
  protect,
  restrictTo(roles.Admin),
  validateBodyMiddleware(createOperationSchema),
  CreateOperationCotroller
)
router.patch(
  '/updateOperation/:Id',
  protect,
  restrictTo(roles.Admin),
  validateBodyMiddleware(updateOperationSchema),
  updateOperationController
)
router.get(
  '/showPassword',
  protect,
  restrictTo(roles.Admin),
  validateQueryMiddleware(showPasswordSchema),
  showPasswordCotroller
)

router.get(
  '/allOperation',
  protect,
  restrictTo(roles.Admin),
  getAllOperationCotroller
)
router.get(
  '/customersStatistics',
  protect,
  restrictTo(roles.Admin),
  getCustomersStatisticsCotroller
)

router.get(
  '/operationsStatistics',
  protect,
  restrictTo(roles.Admin),
  getOperationsStatisticsCotroller
)

module.exports = router
