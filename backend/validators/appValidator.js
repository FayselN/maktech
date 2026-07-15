const Joi = require('joi');

const createAppSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  shortDescription: Joi.string().max(200).required(),
  longDescription: Joi.string().required(),
  developerName: Joi.string().trim().allow(''),
  packageName: Joi.string().trim().required(),
  playStoreUrl: Joi.string().uri().required(),
  iconUrl: Joi.string().uri().required(),
  priceType: Joi.string().valid('free', 'paid', 'freemium').default('free'),
  playStoreRating: Joi.number().min(0).max(5).default(0),
  categories: Joi.array().items(Joi.string()).default([]),
  features: Joi.array().items(Joi.string()).default([]),
  pros: Joi.array().items(Joi.string()).default([]),
  cons: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid('draft', 'published').default('draft'),
});

const updateAppSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  shortDescription: Joi.string().max(200),
  longDescription: Joi.string(),
  developerName: Joi.string().trim().allow(''),
  packageName: Joi.string().trim(),
  playStoreUrl: Joi.string().uri(),
  iconUrl: Joi.string().uri(),
  priceType: Joi.string().valid('free', 'paid', 'freemium'),
  playStoreRating: Joi.number().min(0).max(5),
  categories: Joi.array().items(Joi.string()),
  features: Joi.array().items(Joi.string()),
  pros: Joi.array().items(Joi.string()),
  cons: Joi.array().items(Joi.string()),
  status: Joi.string().valid('draft', 'published'),
  isNewApp: Joi.boolean(),
});

module.exports = { createAppSchema, updateAppSchema };
