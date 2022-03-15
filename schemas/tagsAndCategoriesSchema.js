const Joi = require("joi");
const validateRequest = require("../utils/validateRequest");
// const { tagsDB } = require("../db/collections/collections");

const name = Joi.string().min(1).max(15).trim();

module.exports.postCategory = (req, res, next) => {
  const schema = Joi.object({
    name: name.required(),
    tags: Joi.array().required().min(1).items(name),
  });

  validateRequest(req, res, next, schema);
};
