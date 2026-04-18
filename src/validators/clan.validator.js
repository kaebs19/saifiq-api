const Joi = require('joi');

const createClanSchema = Joi.object({
  name: Joi.string().min(2).max(20).required(),
  description: Joi.string().max(100).allow('', null).optional(),
  badge: Joi.string().max(50).allow('', null).optional(),
  color: Joi.string().max(7).allow('', null).optional(),
});

const updateClanSchema = Joi.object({
  name: Joi.string().min(2).max(20).optional(),
  description: Joi.string().max(100).allow('', null).optional(),
  badge: Joi.string().max(50).allow('', null).optional(),
  color: Joi.string().max(7).allow('', null).optional(),
  isOpen: Joi.boolean().optional(),
  readOnly: Joi.boolean().optional(),
});

const messageSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
  type: Joi.string().valid('text', 'announcement').optional(),
  replyToId: Joi.string().uuid().allow(null).optional(),
});

const gameCodeSchema = Joi.object({
  roomCode: Joi.string().min(1).max(20).required(),
});

const reportSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null).optional(),
});

const muteSchema = Joi.object({
  durationMinutes: Joi.number().integer().min(1).max(10080).required(), // max 7 days
});

module.exports = { createClanSchema, updateClanSchema, messageSchema, gameCodeSchema, reportSchema, muteSchema };
