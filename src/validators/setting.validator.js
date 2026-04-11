const Joi = require('joi');

const setSettingSchema = Joi.object({
  value: Joi.any().required(),
});

const createAdminSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = { setSettingSchema, createAdminSchema };
