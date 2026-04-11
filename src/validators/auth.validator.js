const Joi = require('joi');

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D',
    'any.required': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
    'any.required': '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629',
  }),
});

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.min': '\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
    'string.max': '\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u062A\u062C\u0627\u0648\u0632 30 \u062D\u0631\u0641',
    'any.required': '\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628',
  }),
  email: Joi.string().email().required().messages({
    'string.email': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D',
    'any.required': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
    'any.required': '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629',
  }),
  country: Joi.string().max(5).required().messages({
    'any.required': '\u0627\u0644\u062F\u0648\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0629',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D',
    'any.required': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
    'any.required': '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629',
  }),
});

const googleSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google token \u0645\u0637\u0644\u0648\u0628',
  }),
});

const appleSchema = Joi.object({
  identityToken: Joi.string().required().messages({
    'any.required': 'Apple token \u0645\u0637\u0644\u0648\u0628',
  }),
  fullName: Joi.string().allow('', null).optional(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D',
    'any.required': '\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628',
  }),
});

const verifyResetCodeSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': '\u0627\u0644\u0631\u0645\u0632 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 6 \u0623\u0631\u0642\u0627\u0645',
    'string.pattern.base': '\u0627\u0644\u0631\u0645\u0632 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0623\u0631\u0642\u0627\u0645 \u0641\u0642\u0637',
  }),
});

const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
  }),
});

module.exports = {
  adminLoginSchema,
  registerSchema,
  loginSchema,
  googleSchema,
  appleSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
};
