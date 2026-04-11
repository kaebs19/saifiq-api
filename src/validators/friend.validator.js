const Joi = require('joi');

const sendRequestSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'معرف المستخدم مطلوب',
  }),
});

const addByCodeSchema = Joi.object({
  friendCode: Joi.string().min(4).max(8).required().messages({
    'any.required': 'كود الصديق مطلوب',
  }),
});

const blockSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'معرف المستخدم مطلوب',
  }),
});

module.exports = { sendRequestSchema, addByCodeSchema, blockSchema };
