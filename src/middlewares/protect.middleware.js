const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')

exports.protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.replace('Bearer ', '')
  }
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: req.__('user.You are not logged in , please log in')
    })
  }
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
      .populate('favoriteItems')
      .populate('reviewsCount')
      .populate('OrderCount')

    if (!user) {
      return res.status(411).json({
        status: 'error',
        message: req.__('user.User does not exist')
      })
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: req.__(
          'user.User recently changed password , please log in again '
        )
      })
    }
    req.user = user
    req.orgId = user.organizationId
    next()
  } catch (err) {
    res.status(401).json({
      status: 'error',
      message: req.__('user.You are not logged in , please log in')
    })
  }
}
