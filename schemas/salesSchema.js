const Joi = require("joi");
const { personsDB, productsDB, tagsDB, salesDB } = require("../db/collections/collections");
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
    enabled: Joi.boolean().default(true),
  })
);

module.exports.getSale = a(Joi.object({ id: Joi.number().custom(validIDs(salesDB)).required() }));

module.exports.postSale = a(
  Joi.object({
    person: Joi.number().required().custom(validIDs(personsDB)),

    date: Joi.number().positive().integer().default(Date.now()).max(Date.now()),

    enabled: Joi.boolean().default(true),

    product: Joi.number().custom(validIDs(productsDB)).required(),

    quantity: Joi.number().min(1).integer().default(1),

    specialPrice: Joi.number().positive(),

    cash: Joi.number()
      .positive()
      .precision(2)
      .custom((cash, { state: { ancestors }, error }) => {
        const limit = ancestors[0].specialPrice ?? productsDB.findOne({ $loki: ancestors[0].product }).price;
        return cash > limit ? error("number.max", { limit }) : cash;
      })
      .default(({ product, specialPrice }) => specialPrice ?? productsDB.findOne({ $loki: product }).price),
  })
);
