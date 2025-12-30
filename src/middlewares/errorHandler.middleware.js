const logger = require('../utils/logger')
module.exports = (err, req, res, next) => {
  const status = Number(err.status) || 500
  const message =
    req.__ && typeof err.message === 'string'
      ? req.__(err.message) || err.message
      : err.message

  logger.error({
    message,
    method: req.method,
    url: req.originalUrl,
    status,
    stack: err.stack,
    user: req.user?.id || 'unauthenticated'
  })

  res.status(status).json({
    status: 'error',
    message
  })
}
