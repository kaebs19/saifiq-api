const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((d) => d.message);
    throw new AppError('Validation failed', 422, messages);
  }

  next();
};

module.exports = validate;
