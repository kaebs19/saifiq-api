const Joi = require('joi');

const grantSchema = Joi.object({
  currency: Joi.string().valid('gold', 'gems').required(),
  amount: Joi.number().integer().invalid(0).required(),
  reason: Joi.string().max(200).allow('', null).optional(),
});

module.exports = { grantSchema };
