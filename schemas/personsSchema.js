const Joi = require("joi");
const { validIDs, a } = require("./schemaUtils");
const { personsDB } = require("../db/collections/collections");

const name = Joi.string().min(1).max(30).trim();

module.exports.getPerson = a(Joi.object({ enabled: Joi.boolean().default(true) }));

module.exports.postPerson = a(Joi.object({ name: name.required(), enabled: Joi.boolean().default(true) }));

module.exports.deletePerson = a(Joi.object({ id: Joi.number().custom(validIDs(personsDB)).required() }));

module.exports.patchPerson = a(
  Joi.object({
    name,
    enabled: Joi.boolean(),

    id: Joi.number().custom(validIDs(personsDB)).required(),
  }).or("name", "enabled")
);
