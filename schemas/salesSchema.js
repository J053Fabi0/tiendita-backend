const Joi = require("joi");
const validateRequest = require("../utils/validateRequest");
const { personsDB, productsDB, tagsDB } = require("../db/collections/collections");

const optionalArrayWithAllIDsOfDB = (db) =>
  Joi.array()
    .min(1)
    .unique()
    .default(db.find({}).map(({ $loki }) => $loki))
    .items(Joi.number().valid(...db.find({}).map(({ $loki }) => $loki)));

module.exports.getSales = (req, res, next) => {
  const schema = Joi.object({
    persons: optionalArrayWithAllIDsOfDB(personsDB),
    products: optionalArrayWithAllIDsOfDB(productsDB),
    tags: Joi.array()
      .min(1)
      .unique()
      .items(Joi.number().valid(...tagsDB.find({}).map(({ $loki }) => $loki))),
    tagsBehavior: Joi.string().valid("AND", "OR").default("OR"),
    from: Joi.number().positive().integer().default(0).max(Date.now()),
  });

  validateRequest(req, res, next, schema);
};

module.exports.postNewSale = (req, res, next) => {
  const schema = Joi.object({
    person: Joi.number()
      .required()
      .valid(...personsDB.find({}).map(({ $loki }) => $loki)),

    date: Joi.number().positive().integer().default(Date.now()).max(Date.now()),

    sales: Joi.array()
      .min(1)
      .required()
      .items(
        Joi.object({
          product: Joi.number()
            .valid(...productsDB.find({}).map(({ $loki }) => $loki))
            .required(),

          quantity: Joi.number().min(1).integer().default(1),

          specialPrice: Joi.number().positive(),

          cash: Joi.number()
            .positive()
            .default(({ product }) => productsDB.findOne({ $loki: product }).price),
        })
      ),
  });

  validateRequest(req, res, next, schema);
};
