import handleError from "../utils/handleError";
import CommonResponse from "../types/commonResponse.type";
import { productsDB } from "../db/collections/collections";
import ProductsDB from "../types/collections/productsDB.type";
import PostProduct from "../types/api/products/postProduct.type";
import PatchProduct from "../types/api/products/patchProduct.type";

export const getProducts = ({ body: { enabled } }: { body: { enabled: boolean } }, res: CommonResponse) => {
  try {
    res.send({
      message: productsDB.find({ enabled }).map(({ meta: _, $loki: id, ...data }) => ({ id, ...data })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const getProduct = ({ body: { id } }: { body: { id: number } }, res: CommonResponse) => {
  try {
    res.send({
      message: productsDB.find({ $loki: id }).map(({ meta: _, $loki: id, ...data }) => ({ id, ...data }))[0],
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const postProduct = ({ body }: { body: PostProduct }, res: CommonResponse) => {
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
