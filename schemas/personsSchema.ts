import Joi from "joi";
import { validIDs, a } from "./schemaUtils";
import { personsDB } from "../db/collections/collections";

const name = Joi.string().min(1).max(30).trim();

export const getPerson = a(Joi.object({ enabled: Joi.boolean().default(true) }));

export const postPerson = a(Joi.object({ name: name.required(), enabled: Joi.boolean().default(true) }));

export const deletePerson = a(Joi.object({ id: Joi.number().custom(validIDs(personsDB)).required() }));

export const patchPerson = a(
  Joi.object({
    name,
    enabled: Joi.boolean(),

    id: Joi.number().custom(validIDs(personsDB)).required(),
  }).or("name", "enabled")
);
