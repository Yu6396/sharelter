function validationmiddleware(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body)
      if (error) {
        return res.status(400).json(error.details.map((error) => error.message))
      }
      next()
    }
}
  
  module.exports = validationmiddleware