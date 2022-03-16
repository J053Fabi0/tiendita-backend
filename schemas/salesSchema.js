const Joi = require("joi");
const { personsDB, productsDB, tagsDB } = require("../db/collections/collections");
const { a, validIDs, optionalArrayWithAllIDsOfDB: arrayIDs } = require("./schemaUtils");

module.exports.getSales = a(
  Joi.object({
    persons: arrayIDs(personsDB).default(personsDB.find({}).map(({ $loki }) => $loki)),
    products: arrayIDs(productsDB).default(productsDB.find({}).map(({ $loki }) => $loki)),
    tags: Joi.array()
      .min(1)
      .unique()
      .items(Joi.number().custom(validIDs(tagsDB))),
    tagsBehavior: Joi.string().valid("AND", "OR").default("OR"),
    from: Joi.number().positive().integer().default(0).max(Date.now()),
  })
);

module.exports.postNewSale = a(
  Joi.object({
    person: Joi.number().required().custom(validIDs(personsDB)),

    date: Joi.number().positive().integer().default(Date.now()).max(Date.now()),

    sales: Joi.array()
      .min(1)
      .required()
      .items(
        Joi.object({
          product: Joi.number().custom(validIDs(productsDB)).required(),

          quantity: Joi.number().min(1).integer().default(1),

          specialPrice: Joi.number().positive(),

          cash: Joi.number()
            .positive()
            .default(({ product }) => productsDB.findOne({ $loki: product }).price),
        })
      ),
  })
);
