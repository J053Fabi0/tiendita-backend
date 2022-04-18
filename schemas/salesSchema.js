const Joi = require("joi");
const { personsDB, productsDB, tagsDB, salesDB } = require("../db/collections/collections");
const { a, validIDs, optionalArrayWithAllIDsOfDB: arrayIDs } = require("./schemaUtils");

module.exports.getSales = a(
  Joi.object({
    enabled: Joi.boolean().default(true),
    tagsBehavior: Joi.string().valid("AND", "OR").default("OR"),
    from: Joi.number().positive().integer().default(0).max(Date.now()),
    tags: arrayIDs(tagsDB).default(-1),
    persons: arrayIDs(personsDB).default(() => personsDB.find({}).map(({ $loki }) => $loki)),
    products: arrayIDs(productsDB).default(() => productsDB.find({}).map(({ $loki }) => $loki)),
  })
);

module.exports.getSale = a(Joi.object({ id: Joi.number().custom(validIDs(salesDB)).required() }));

module.exports.patchSale = a(
  Joi.object({
    id: Joi.number().custom(validIDs(salesDB)).required(),
    product: Joi.number().custom(validIDs(productsDB)),
    person: Joi.number().custom(validIDs(personsDB)),
    specialPrice: Joi.number().min(-1).integer(),
    date: Joi.date().max("now").timestamp(),
    quantity: Joi.number().min(1).integer(),
    enabled: Joi.boolean(),
    cash: Joi.number()
      .min(0)
      .precision(2)
      .custom((cash, { state: { ancestors }, error }) => {
        const { id, specialPrice } = ancestors[0];
        const sale = salesDB.findOne({ $loki: id });
        let limit;
        if (specialPrice != undefined)
          limit = specialPrice === -1 ? productsDB.findOne({ $loki: sale.product })?.price || 0 : specialPrice;
        else limit = sale.specialPrice ?? (productsDB.findOne({ $loki: sale.product })?.price || 0);
        return cash > limit ? error("number.max", { limit }) : cash;
      }),
  }).or("person", "product", "quantity", "specialPrice", "cash", "date", "enabled")
);

module.exports.deleteSale = a(Joi.object({ id: Joi.number().custom(validIDs(salesDB)).required() }));

module.exports.postSale = a(
  Joi.object({
    person: Joi.number().required().custom(validIDs(personsDB)),

    date: Joi.date()
      .timestamp()
      .max("now")
      .default(() => Date.now()),

    enabled: Joi.boolean().default(true),

    product: Joi.number().custom(validIDs(productsDB)).required(),

    quantity: Joi.number().min(1).integer().default(1),

    specialPrice: Joi.number().positive(),

    cash: Joi.number()
      .min(0)
      .precision(2)
      .custom((cash, { state: { ancestors }, error }) => {
        const limit = ancestors[0].specialPrice ?? productsDB.findOne({ $loki: ancestors[0].product }).price;
        return cash > limit ? error("number.max", { limit }) : cash;
      })
      .default(({ product, specialPrice }) => specialPrice ?? productsDB.findOne({ $loki: product }).price),
  })
);
