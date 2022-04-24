import Joi from "joi";
import { productsDB, tagsDB } from "../db/collections/collections";
import { validIDs, a, optionalArrayWithAllIDsOfDB } from "./schemaUtils";

const name = Joi.string().min(1).max(50).trim();
const stock = Joi.number().min(0).integer();
const description = Joi.string().max(400).min(0);
const price = Joi.number().positive().precision(2);

export const getProducts = a(Joi.object({ enabled: Joi.boolean().default(true) }));
export const getProduct = a(Joi.object({ id: Joi.number().custom(validIDs(productsDB)).required() }));

export const postProduct = a(
  Joi.object({
    name: name.required(),
    price: price.required(),
    stock: stock.required(),
    enabled: Joi.boolean().default(true),
    description: description.default(""),
    tags: optionalArrayWithAllIDsOfDB(tagsDB).default([]),
  })
);

export const deleteProduct = a(Joi.object({ id: Joi.number().custom(validIDs(productsDB)).required() }));

export const patchProduct = a(
  Joi.object({
    name,
    price,
    stock,
    description,
    enabled: Joi.boolean(),

    deleteTags: Joi.array()
      .min(1)
      .items(
        Joi.number().custom((tag, { error, state }) => {
          const valids = productsDB.findOne({ $loki: state.ancestors[1].id })?.tags || [];
          return valids.includes(tag) ? tag : error("any.only", { valids });
        })
      ),
    addTags: Joi.array()
      .min(1)
      .unique()
      .items(
        Joi.number().custom((id, { error, state }) => {
          // tags already present are invalid
          const invalids = productsDB.findOne({ $loki: state.ancestors[1].id })?.tags || [];
          if (invalids.includes(id)) return error("any.invalid", { invalids });

          const valids = tagsDB.find({}).map(({ $loki }) => $loki);
          return valids.includes(id) ? id : error("any.only", { valids });
        })
      ),

    id: Joi.number().custom(validIDs(productsDB)).required(),
  }).or("name", "price", "stock", "description", "enabled", "deleteTags", "addTags")
);
