import Joi from "joi";
import SalesDB from "../types/collections/salesDB.type";
import { a, validIDs, optionalArrayWithAllIDsOfDB as arrayIDs } from "./schemaUtils";
import { personsDB, productsDB, tagsDB, salesDB } from "../db/collections/collections";

export const getSales = a(
  Joi.object({
    enabled: Joi.boolean().default(true),
    tagsBehavior: Joi.string().valid("AND", "OR").default("OR"),
    from: Joi.date().timestamp().default(0),
    tags: arrayIDs(tagsDB).default(-1),
    persons: arrayIDs(personsDB).default(() => personsDB.find({}).map(({ $loki }) => $loki)),
    products: arrayIDs(productsDB).default(() => productsDB.find({}).map(({ $loki }) => $loki)),
  }),
  "query"
);

export const getSale = a(Joi.object({ id: Joi.number().custom(validIDs(salesDB)).required() }));

export const patchSale = a(
  Joi.object({
    id: Joi.number().custom(validIDs(salesDB)).required(),
    product: Joi.number().custom(validIDs(productsDB)),
    person: Joi.number().custom(validIDs(personsDB)),
    specialPrice: Joi.number().min(-1).integer(),
    date: Joi.date().max("now").timestamp(),
    quantity: Joi.number().min(1).integer(),
    enabled: Joi.boolean(),
    cash: Joi.number()
      .min(0)
      .precision(2)
      .custom((cash, { state: { ancestors }, error }) => {
        const { id, specialPrice, quantity } = ancestors[0];
        const sale = salesDB.findOne({ $loki: id }) as SalesDB;
        const realQuantity = quantity ?? sale.quantity;
        let limit;
        if (specialPrice != undefined)
          limit =
            specialPrice === -1
              ? (productsDB.findOne({ $loki: sale.product })?.price || 0) * realQuantity
              : specialPrice;
        else limit = sale.specialPrice ?? (productsDB.findOne({ $loki: sale.product })?.price || 0) * realQuantity;
        return cash > limit ? error("number.max", { limit }) : cash;
      }),
  }).or("person", "product", "quantity", "specialPrice", "cash", "date", "enabled")
);

export const deleteSale = a(Joi.object({ id: Joi.number().custom(validIDs(salesDB)).required() }));

export const postSale = a(
  Joi.object({
    date: Joi.date()
      .timestamp()
      .max("now")
      .default(() => Date.now()),

    enabled: Joi.boolean().default(true),

    product: Joi.number().custom(validIDs(productsDB)).required(),

    quantity: Joi.number().min(1).integer().default(1),

    specialPrice: Joi.number().min(0),

    cash: Joi.number()
      .min(0)
      .precision(2)
      .custom((cash, { state: { ancestors }, error }) => {
        const limit =
          ancestors[0].specialPrice ??
          productsDB.findOne({ $loki: ancestors[0].product })!.price * ancestors[0].quantity;
        return cash > limit ? error("number.max", { limit }) : cash;
      })
      .default(({ product, specialPrice }) => specialPrice ?? productsDB.findOne({ $loki: product })!.price),
  })
);
