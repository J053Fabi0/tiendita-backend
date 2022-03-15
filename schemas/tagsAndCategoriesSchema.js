const Joi = require("joi");
const validateRequest = require("../utils/validateRequest");
const { tagsDB, categoriesDB, productsDB } = require("../db/collections/collections");

const a =
  (schema, element = undefined) =>
  (req, res, next) =>
    validateRequest(req, res, next, schema, element);

const name = Joi.string().min(1).max(15).trim();
const optionalArrayWithAllIDsOfDB = (db) =>
  Joi.array()
    .min(1)
    .unique()
    .items(Joi.number().valid(...db.find({}).map(({ $loki }) => $loki)));

module.exports.postCategory = a(
  Joi.object({
    name: name.required(),
    tags: Joi.array().required().min(1).items(name),
  })
);

module.exports.postTag = a(
  Joi.object({
    name: name.required(),
    category: Joi.number()
      .valid(...categoriesDB.find({}).map(({ $loki }) => $loki))
      .required(),
    products: optionalArrayWithAllIDsOfDB(productsDB).default([]),
  })
);
