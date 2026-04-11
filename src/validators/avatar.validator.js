const Joi = require('joi');

const createAvatarSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'any.required': 'اسم الصورة مطلوب',
  }),
  imageUrl: Joi.string().required().messages({
    'any.required': 'رابط الصورة مطلوب',
  }),
  gemCost: Joi.number().integer().min(0).default(0),
  sortOrder: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

const updateAvatarSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  gemCost: Joi.number().integer().min(0).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

module.exports = { createAvatarSchema, updateAvatarSchema };
