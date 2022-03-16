const Joi = require("joi");
const validateRequest = require("../utils/validateRequest");

const validIDs =
  (db) =>
  (id, { error }) => {
    const valids = db.find({}).map(({ $loki }) => $loki);
    return valids.includes(id) ? id : error("any.only", { valids });
  };

const a =
  (schema, element = undefined) =>
  (req, res, next) =>
    validateRequest(req, res, next, schema, element);

const optionalArrayWithAllIDsOfDB = (db) =>
  Joi.array()
    .min(1)
    .unique()
    .items(Joi.number().custom(validIDs(db)));

module.exports = { validIDs, a, optionalArrayWithAllIDsOfDB };
