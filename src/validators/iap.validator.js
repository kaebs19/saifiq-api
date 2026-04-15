const Joi = require('joi');

const verifySchema = Joi.object({
  productId: Joi.string().required(),
  transactionId: Joi.string().required(),
});

module.exports = { verifySchema };
