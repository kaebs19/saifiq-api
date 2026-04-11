const Joi = require('joi');

const updateItemSchema = Joi.object({
  nameAr: Joi.string().min(1).max(100).optional(),
  descriptionAr: Joi.string().max(500).allow('', null).optional(),
  gemCost: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = { updateItemSchema };
