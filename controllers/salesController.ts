import handleError from "../utils/handleError";
import SalesDB from "../types/collections/salesDB.type";
import GetSales from "../types/api/sales/getSales.type";
import PostSale from "../types/api/sales/postSale.type";
import PatchSale from "../types/api/sales/patchSale.type";
import CommonResponse from "../types/commonResponse.type";
import { salesDB, productsDB } from "../db/collections/collections";

export const getSales = (
  { query: { persons, products, tagsBehavior, tags, from, enabled } }: GetSales,
  res: CommonResponse
) => {
  try {
    res.send({
      message: salesDB
        .chain()
        .find({ enabled })
        .find({ date: { $gte: +from } })
        .find({ person: { $in: persons }, product: { $in: products } })
        .simplesort("date", { desc: true }) // los más recientes primero
        .data()
        .map(({ meta: _, enabled: __, $loki: id, date, ...sale }) => ({ id, date: +date, ...sale }))
        .filter(({ product }) => {
          // If the tags are -1, then there shouldn't be any tag filtering at all.
          if (tags === -1) return true;

          const productTags = productsDB.findOne({ $loki: product })!.tags;

          if (tagsBehavior === "AND") {
            for (const tag of tags) if (!productTags.includes(tag)) return false;
            return true;
          } else {
            for (const tag of tags) if (productTags.includes(tag)) return true;
            return false;
          }
        }),
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const getSale = ({ body: { id } }: { body: { id: number } }, res: CommonResponse) => {
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
      if (specialPrice === -1 || specialPrice === productsDB.findOne({ $loki: obj.product })!.price)
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
    const { date, ...sale } = body;
    // Insert sale
    const { $loki } = salesDB.insertOne({ person: authPerson!.id, date: +date, ...sale } as SalesDB) as SalesDB;

    // Reduce stock
    productsDB.findOne({ $loki: body.product })!.stock -= body.quantity;

    // Send the id of the new sale
    res.status(200).send({ message: { id: $loki } });
  } catch (e) {
    handleError(res, e);
  }
};
