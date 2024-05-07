import Joi from "joi";
import SalesDB from "../types/collections/salesDB.type.ts";
import { a, validIDs, optionalArrayWithAllIDsOfDB as arrayIDs } from "./schemaUtils.ts";
import { personsDB, productsDB, tagsDB, salesDB } from "../db/collections/collections.ts";

export const getSales = a(
  Joi.object({
    tags: arrayIDs(tagsDB).default(-1),
    enabled: Joi.boolean().default(true),
    from: Joi.date().timestamp().default(0),
    until: Joi.date().timestamp().default(Infinity),
    tagsBehavior: Joi.string().valid("AND", "OR").default("OR"),
    persons: arrayIDs(personsDB).default(() => personsDB.find().map(({ $loki }) => $loki)),
    products: arrayIDs(productsDB).default(() => productsDB.find().map(({ $loki }) => $loki)),
  }),
  "query"
);

export const getSale = a(Joi.object({ id: Joi.number().custom(validIDs(salesDB)).required() }), "query");

export const patchSale = a(
  Joi.object({
    id: Joi.number().custom(validIDs(salesDB)).required(),
    product: Joi.number().custom(validIDs(productsDB)),
    person: Joi.number().custom(validIDs(personsDB)),
    specialPrice: Joi.number().min(-1).integer(),
    quantity: Joi.number().min(1).integer(),
    date: Joi.date().timestamp(),
    enabled: Joi.boolean(),
    cash: Joi.number()
      .min(0)
      .precision(2)
      .custom((cash, { state: { ancestors }, error }) => {
        const { id, specialPrice, quantity } = ancestors[0];
        const sale = salesDB.findOne({ $loki: id }) as SalesDB;
        const realQuantity = quantity ?? sale.quantity;
        console.log(realQuantity);
        let limit;
        if (specialPrice != undefined)
          limit =
            (specialPrice === -1 ? productsDB.findOne({ $loki: sale.product.id })?.price || 0 : specialPrice) *
            realQuantity;
        else
          limit =
            (sale.specialPrice ?? (productsDB.findOne({ $loki: sale.product.id })?.price || 0)) * realQuantity;
        return cash > limit ? error("number.max", { limit }) : cash;
      }),
  }).or("person", "product", "quantity", "specialPrice", "cash", "date", "enabled")
);

export const deleteSale = a(Joi.object({ id: Joi.number().custom(validIDs(salesDB)).required() }));

export const postSale = a(
  Joi.object({
    date: Joi.date()
      .timestamp()
      .default(() => Date.now()),

    comment: Joi.string(),

    specialPrice: Joi.number().min(0),

    enabled: Joi.boolean().default(true),

    quantity: Joi.number().min(1).integer().default(1),

    product: Joi.number().custom(validIDs(productsDB)).required(),

    cash: Joi.number()
      .min(0)
      .precision(2)
      .custom((cash, { state: { ancestors }, error }) => {
        const limit =
          (ancestors[0].specialPrice ?? productsDB.findOne({ $loki: ancestors[0].product })!.price) *
          ancestors[0].quantity;
        return cash > limit ? error("number.max", { limit }) : cash;
      })
      .default(({ product, specialPrice }) => specialPrice ?? productsDB.findOne({ $loki: product })!.price),
  })
);
