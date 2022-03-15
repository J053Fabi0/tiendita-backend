const Joi = require("joi");
const { validIDs, a } = require("./schemaUtils");
const { categoriesDB, productsDB, tagsDB } = require("../db/collections/collections");

const name = Joi.string().min(1).max(50).trim();
const price = Joi.number().positive().precision(2);
const stock = Joi.number().positive().integer();
const optionalArrayWithAllIDsOfDB = (db) =>
  Joi.array()
    .min(1)
    .unique()
    .items(Joi.number().custom(validIDs(db)));

module.exports.postProduct = a(
  Joi.object({
    name: name.required(),
    price: price.required(),
    stock: stock.required(),
    enabled: Joi.boolean().default(true),
    description: Joi.string().default(""),
    tags: optionalArrayWithAllIDsOfDB(tagsDB).default([]),
  })
);

// module.exports.deleteCategory = a(Joi.object({ id: Joi.number().custom(validIDs(categoriesDB)).required() }));

// module.exports.patchCategory = a(
//   Joi.object({ name, id: Joi.number().custom(validIDs(categoriesDB)).required() }).or("name")
// );
