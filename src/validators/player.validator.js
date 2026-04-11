const Joi = require('joi');

const updateGemsSchema = Joi.object({
  gems: Joi.number().integer().min(0).required().messages({
    'number.min': '\u0627\u0644\u062C\u0648\u0627\u0647\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 0 \u0623\u0648 \u0623\u0643\u062B\u0631',
    'any.required': '\u0639\u062F\u062F \u0627\u0644\u062C\u0648\u0627\u0647\u0631 \u0645\u0637\u0644\u0648\u0628',
  }),
  reason: Joi.string().max(200).allow('', null).optional(),
});

const setBanSchema = Joi.object({
  isBanned: Joi.boolean().required(),
});

module.exports = { updateGemsSchema, setBanSchema };
