const Joi = require("joi");
const validateRequest = require("../utils/validateRequest");
// const { tagsDB } = require("../db/collections/collections");

module.exports.postCategory = (req, res, next) => {
  const schema = Joi.object({});

  validateRequest(req, res, next, schema);
};
