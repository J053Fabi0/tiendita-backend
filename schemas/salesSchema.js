const Joi = require("joi");
const validateRequest = require("../utils/validateRequest");
const { personsDB, productsDB } = require("../db/collections/collections");

module.exports.postNewSale = (req, res, next) => {
  const schema = Joi.object({
    person: Joi.number()
      .valid(...personsDB.find({}).map(({ $loki }) => $loki))
      .required(),

    date: Joi.number().positive().optional().integer().default(Date.now()),

    sales: Joi.array()
      .required()
      .min(1)
      .items(
        Joi.object({
          product: Joi.number()
            .valid(...productsDB.find({}).map(({ $loki }) => $loki))
            .required(),

          quantity: Joi.number().min(1).optional().integer().default(1),

          specialPrice: Joi.number().positive().optional(),

          cash: Joi.number()
            .optional()
            .positive()
            .default(({ product }) => productsDB.findOne({ $loki: product }).price),
        })
      ),
  });
  validateRequest(req, res, next, schema);
};
