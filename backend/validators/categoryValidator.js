const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  iconUrl: Joi.string().uri().allow(null, ''),
  sortOrder: Joi.number().integer().min(0).default(0),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  iconUrl: Joi.string().uri().allow(null, ''),
  sortOrder: Joi.number().integer().min(0),
});

module.exports = { createCategorySchema, updateCategorySchema };
