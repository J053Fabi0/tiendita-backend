import handleError from "../utils/handleError.ts";
import CommonResponse from "../types/commonResponse.type.ts";
import { productsDB } from "../db/collections/collections.ts";
import ProductsDB from "../types/collections/productsDB.type.ts";
import PostProduct from "../types/api/products/postProduct.type.ts";
import PatchProduct from "../types/api/products/patchProduct.type.ts";

export const getProducts = ({ query: { enabled } }: { query: { enabled: boolean } }, res: CommonResponse) => {
  try {
    res.send({
      message: productsDB
        .find()
        .filter((a) => a.enabled === enabled)
        .map(({ meta: _, enabled: __, $loki: id, ...data }) => ({ id, ...data })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const getProduct = ({ query: { id } }: { query: { id: number } }, res: CommonResponse) => {
  try {
    res.send({
      message: productsDB.find({ $loki: id }).map(({ meta: _, $loki: id, ...data }) => ({ id, ...data }))[0],
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const postProduct = ({ body }: PostProduct, res: CommonResponse) => {
  try {
    res.send({ message: productsDB.insertOne(body)!.$loki });
  } catch (e) {
    handleError(res, e);
  }
};

export const deleteProduct = ({ body: { id } }: { body: { id: number } }, res: CommonResponse) => {
  try {
    productsDB.findOne({ $loki: id })!.enabled = false;
    res.status(204).send();
  } catch (e) {
    handleError(res, e);
  }
};

export const patchProduct = (
  { body: { id, deleteTags, addTags, ...newData } }: { body: PatchProduct },
  res: CommonResponse
) => {
  try {
    const obj = productsDB.findOne({ $loki: id }) as ProductsDB;
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) (obj as any)[newDataKey] = (newData as any)[newDataKey];

    if (deleteTags) {
      const tags = [...obj.tags];
      for (const deleteTag of deleteTags) tags.splice(tags.indexOf(deleteTag), 1);
      obj.tags = tags;
    }

    if (addTags) {
      const tags = [...obj.tags];
      for (const addTag of addTags) tags.push(addTag);
      obj.tags = tags;
    }

    res.send();
  } catch (e) {
    handleError(res, e);
  }
};
