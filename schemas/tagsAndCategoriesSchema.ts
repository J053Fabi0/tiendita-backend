import Joi from "joi";
import { validIDs, a, optionalArrayWithAllIDsOfDB } from "./schemaUtils";
import { categoriesDB, productsDB, tagsDB } from "../db/collections/collections";

const name = Joi.string().min(1).max(15).trim();

export const postCategory = a(
  Joi.object({
    name: name.required(),
    tags: Joi.array().required().min(1).items(name).unique(),
  })
);
export const postTag = a(
  Joi.object({
    name: name.required(),
    category: Joi.number().custom(validIDs(categoriesDB)).required(),
    products: optionalArrayWithAllIDsOfDB(productsDB).default([]),
  })
);

export const deleteCategory = a(Joi.object({ id: Joi.number().custom(validIDs(categoriesDB)).required() }));
export const deleteTag = a(Joi.object({ id: Joi.number().custom(validIDs(tagsDB)).required() }));

export const patchCategory = a(
  Joi.object({ name, id: Joi.number().custom(validIDs(categoriesDB)).required() }).or("name")
);
export const patchTag = a(Joi.object({ name, id: Joi.number().custom(validIDs(tagsDB)).required() }).or("name"));
