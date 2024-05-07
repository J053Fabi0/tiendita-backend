import handleError from "../utils/handleError.ts";
import SalesDB from "../types/collections/salesDB.type.ts";
import GetSales from "../types/api/sales/getSales.type.ts";
import PostSale from "../types/api/sales/postSale.type.ts";
import PatchSale from "../types/api/sales/patchSale.type.ts";
import CommonResponse from "../types/commonResponse.type.ts";
import { salesDB, productsDB, personsDB } from "../db/collections/collections.ts";

export const getSales = (
  { query: { persons, products, tagsBehavior, tags, from, until, enabled } }: GetSales,
  res: CommonResponse
) => {
  try {
    res.send({
      message: salesDB
        .find()
        .filter((a) => a.enabled === enabled)
        .filter(({ date }) => date <= +until && date >= +from)
        .filter(({ person }) => persons.includes(person.id))
        .filter(({ product }) => products.includes(product.id))
        .filter(({ product }) => {
          // If the tags are -1, then there shouldn't be any tag filtering at all.
          if (tags === -1) return true;

          const productTags = productsDB.findOne({ $loki: product.id })!.tags;

          if (tagsBehavior === "AND") {
            for (const tag of tags) if (!productTags.includes(tag)) return false;
            return true;
          } else {
            for (const tag of tags) if (productTags.includes(tag)) return true;
            return false;
          }
        })
        .sort((a, b) => b.date - a.date) // los más recientes primero
        .map(({ meta: _, enabled: __, $loki: id, date, ...sale }) => ({ id, date: +date, ...sale })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const getSale = ({ query: { id } }: { query: { id: number } }, res: CommonResponse) => {
  try {
    const { meta: _, $loki, ...data } = salesDB.findOne({ $loki: id }) as SalesDB;
    res.status(200).send({ message: { id: $loki, ...data } });
  } catch (e) {
    handleError(res, e);
  }
};

export const patchSale = (
  { body: { id, date, specialPrice, ...newData } }: { body: PatchSale },
  res: CommonResponse
) => {
  try {
    const obj = salesDB.findOne({ $loki: id }) as SalesDB;
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) (obj as any)[newDataKey] = (newData as any)[newDataKey];

    if (specialPrice != undefined) {
      if (specialPrice === -1 || specialPrice === productsDB.findOne({ $loki: obj.product.id })!.price)
        delete obj.specialPrice;
      else obj.specialPrice = specialPrice;
    }

    if (date) obj.date = +date;

    res.status(200).send();
  } catch (e) {
    handleError(res, e);
  }
};

export const deleteSale = ({ body: { id } }: { body: { id: number } }, res: CommonResponse) => {
  try {
    salesDB.findOne({ $loki: id })!.enabled = false;
    res.status(204).send();
  } catch (e) {
    handleError(res, e);
  }
};

export const postSale = ({ body, authPerson }: PostSale, res: CommonResponse) => {
  try {
    const { date, product: productID, ...sale } = body;
    // Insert sale
    const product = productsDB.findOne({ $loki: productID });
    const person = personsDB.findOne({ $loki: authPerson!.id });

    const { $loki } = salesDB.insertOne({
      ...sale,
      date: +date,
      person: { id: person?.$loki, name: person?.name },
      product: { id: productID, name: product?.name, price: product?.price },
    } as SalesDB) as SalesDB;

    // Reduce stock
    product!.stock -= body.quantity;

    // Send the id of the new sale
    res.status(200).send({ message: { id: $loki } });
  } catch (e) {
    handleError(res, e);
  }
};
