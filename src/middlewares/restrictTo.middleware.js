exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: req.__(
          'user.You do not have permission to perform this action'
        )
      })
    }
    next()
  }
}
