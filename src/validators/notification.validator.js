const Joi = require('joi');

const sendNotificationSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.guid': 'معرف المستخدم غير صالح',
    'any.required': 'معرف المستخدم مطلوب',
  }),
  title: Joi.string().max(200).required().messages({
    'any.required': 'عنوان الإشعار مطلوب',
  }),
  body: Joi.string().max(1000).required().messages({
    'any.required': 'نص الإشعار مطلوب',
  }),
  data: Joi.object().optional(),
});

const broadcastSchema = Joi.object({
  title: Joi.string().max(200).required().messages({
    'any.required': 'عنوان الإشعار مطلوب',
  }),
  body: Joi.string().max(1000).required().messages({
    'any.required': 'نص الإشعار مطلوب',
  }),
  data: Joi.object().optional(),
});

const fcmTokenSchema = Joi.object({
  fcmToken: Joi.string().required().messages({
    'any.required': 'FCM token مطلوب',
  }),
});

module.exports = { sendNotificationSchema, broadcastSchema, fcmTokenSchema };
