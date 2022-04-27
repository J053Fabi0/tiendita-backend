import handleError from "../utils/handleError";
import TagsDB from "../types/collections/tagsDB.type";
import CommonResponse from "../types/commonResponse.type";
import CategoriesDB from "../types/collections/categoriesDB.type";
import PostTag from "../types/api/tagsAndCategories/postTag.type";
import PatchTag from "../types/api/tagsAndCategories/patchTag.type";
import PostCategory from "../types/api/tagsAndCategories/postCategory.type";
import PatchCategory from "../types/api/tagsAndCategories/patchCategory.type";
import { tagsDB, categoriesDB, productsDB } from "../db/collections/collections";

export const getTags = (_: any, res: CommonResponse) => {
  try {
    res.send({
      message: categoriesDB.find({}).map(({ meta: _, $loki: id, tags, ...data }) => ({
        id,
        ...data,

        tags: tags.map(($loki) => {
          const { $loki: id, name } = tagsDB.findOne({ $loki }) as TagsDB;
          return { id, name };
        }),
      })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

export const postCategory = ({ body: { name, tags } }: PostCategory, res: CommonResponse) => {
  try {
    const category = categoriesDB.insertOne({ name, tags: [] } as unknown as CategoriesDB) as CategoriesDB;

    for (const tagName of tags)
      category.tags = [
        ...category.tags,
        tagsDB.insertOne({ name: tagName, products: [], category: category.$loki } as unknown as TagsDB)!.$loki,
      ];

    res.send({ message: { id: category.$loki, tagsIDs: category.tags } });
  } catch (e) {
    handleError(res, e);
  }
};

export const postTag = ({ body }: PostTag, res: CommonResponse) => {
  try {
    const tagID = tagsDB.insertOne(body)!.$loki;
    const thisCategory = categoriesDB.findOne({ $loki: body.category }) as CategoriesDB;
    thisCategory.tags = [...thisCategory.tags, tagID];

    res.send({ message: tagID });
  } catch (e) {
    handleError(res, e);
  }
};

const deleteTagFromProducts = (tagID: number) => {
  const products = productsDB.find({ tags: { $contains: tagID } });
  for (const product of products) {
    const tags = [...product.tags];
    tags.splice(tags.indexOf(tagID), 1);
    product.tags = tags;
  }
};
const deleteCategoryF = (id: number) => {
  categoriesDB.findAndRemove({ $loki: id });
  tagsDB.findAndRemove({ category: id });
};
export const deleteCategory = ({ body: { id } }: { body: { id: number } }, res: CommonResponse) => {
  try {
    const tagsInCategory = tagsDB.find({ category: id });
    for (const { $loki: tagID } of tagsInCategory) deleteTagFromProducts(tagID);

    deleteCategoryF(id);
    res.status(204).send();
  } catch (e) {
    handleError(res, e);
  }
};

export const deleteTag = ({ body: { id: tagID } }: { body: { id: number } }, res: CommonResponse) => {
  try {
    const { category: categoryID } = tagsDB.findOne({ $loki: tagID }) as TagsDB;
    tagsDB.findAndRemove({ $loki: tagID });
    const category = categoriesDB.findOne({ $loki: categoryID }) as CategoriesDB;
    const tags = category.tags;
    const tagIndex = tags.indexOf(tagID);

    if (tagIndex !== -1)
      if (tags.length === 1) {
        deleteCategoryF(categoryID);
      } else {
        category.tags = [...tags.slice(0, tagIndex), ...tags.slice(tagIndex + 1)];
      }

    deleteTagFromProducts(tagID);

    res.status(204).send();
  } catch (e) {
    handleError(res, e);
  }
};

export const patchCategory = ({ body: { id, ...newData } }: PatchCategory, res: CommonResponse) => {
  try {
    const obj = categoriesDB.findOne({ $loki: id });
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) (obj as any)[newDataKey] = (newData as any)[newDataKey];

    res.send();
  } catch (e) {
    handleError(res, e);
  }
};

export const patchTag = ({ body: { id, ...newData } }: PatchTag, res: CommonResponse) => {
  try {
    const obj = tagsDB.findOne({ $loki: id });
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) (obj as any)[newDataKey] = (newData as any)[newDataKey];

    res.send();
  } catch (e) {
    handleError(res, e);
  }
};
