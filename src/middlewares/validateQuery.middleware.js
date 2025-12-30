const validateQueryMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false
    })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.context?.key || null,
        message: req.__(detail.message) || detail.message
      }))

      return res.status(400).json({
        status: 'error',
        errors
      })
    }

    req.query = value
    next()
  }
}

module.exports = validateQueryMiddleware
