const Joi = require("joi");
const { validIDs, a } = require("./schemaUtils");
const { categoriesDB, productsDB, tagsDB } = require("../db/collections/collections");

const name = Joi.string().min(1).max(15).trim();
const optionalArrayWithAllIDsOfDB = (db) =>
  Joi.array()
    .min(1)
    .unique()
    .items(Joi.number().custom(validIDs(db)));

module.exports.postCategory = a(
  Joi.object({
    name: name.required(),
    tags: Joi.array().required().min(1).items(name),
  })
);

module.exports.postTag = a(
  Joi.object({
    name: name.required(),
    category: Joi.number().custom(validIDs(categoriesDB)).required(),
    products: optionalArrayWithAllIDsOfDB(productsDB).default([]),
  })
);

module.exports.deleteCategory = a(Joi.object({ id: Joi.number().custom(validIDs(categoriesDB)).required() }));
module.exports.deleteTag = a(Joi.object({ id: Joi.number().custom(validIDs(tagsDB)).required() }));
