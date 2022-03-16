const handleError = require("../utils/handleError");
const { tagsDB, categoriesDB, productsDB } = require("../db/collections/collections");

const a = {};

a.getTags = (_, res) => {
  try {
    res.send({
      message: categoriesDB.find({}).map(({ meta: _, $loki: id, tags, ...data }) => ({
        id,
        ...data,

        tags: tags.map(($loki) => {
          const { $loki: id, name } = tagsDB.findOne({ $loki });
          return { id, name };
        }),
      })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

a.postCategory = ({ body: { name, tags } }, res) => {
  try {
    const category = categoriesDB.insertOne({ name, tags: [] });

    for (const tagName of tags)
      category.tags = [
        ...category.tags,
        tagsDB.insertOne({ name: tagName, products: [], category: category.$loki }).$loki,
      ];

    res.send({ message: { id: category.$loki, tagsIDs: category.tags } });
  } catch (e) {
    handleError(res, e);
  }
};

a.postTag = ({ body: { name, category, products } }, res) => {
  try {
    const tagID = tagsDB.insertOne({ name, category, products }).$loki;
    const thisCategory = categoriesDB.findOne({ $loki: category });
    thisCategory.tags = [...thisCategory.tags, tagID];

    res.send({ message: tagID });
  } catch (e) {
    handleError(res, e);
  }
};

const deleteTagFromProducts = (tagID) => {
  const products = productsDB.find({ tags: { $contains: tagID } });
  for (const product of products) {
    const tags = [...product.tags];
    tags.splice(tags.indexOf(tagID), 1);
    product.tags = tags;
  }
};
const deleteCategory = (id) => {
  categoriesDB.findAndRemove({ $loki: id });
  tagsDB.findAndRemove({ category: id });
};
a.deleteCategory = ({ body: { id } }, res) => {
  try {
    const tagsInCategory = tagsDB.find({ category: id });
    for (const { $loki: tagID } of tagsInCategory) deleteTagFromProducts(tagID);

    deleteCategory(id);
    res.status(204).send();
  } catch (e) {
    handleError(res, e);
  }
};

a.deleteTag = ({ body: { id: tagID } }, res) => {
  try {
    const { category: categoryID } = tagsDB.findOne({ $loki: tagID });
    tagsDB.findAndRemove({ $loki: tagID });
    const category = categoriesDB.findOne({ $loki: categoryID });
    const tags = category.tags;
    const tagIndex = tags.indexOf(tagID);

    if (tagIndex !== -1)
      if (tags.length === 1) {
        deleteCategory(categoryID);
      } else {
        category.tags = [...tags.slice(0, tagIndex), ...tags.slice(tagIndex + 1)];
      }

    deleteTagFromProducts(tagID);

    res.status(204).send();
  } catch (e) {
    handleError(res, e);
  }
};

a.patchCategory = ({ body: { id, ...newData } }, res) => {
  try {
    const obj = categoriesDB.findOne({ $loki: id });
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) obj[newDataKey] = newData[newDataKey];

    res.send();
  } catch (e) {
    handleError(res, e);
  }
};

a.patchTag = ({ body: { id, ...newData } }, res) => {
  try {
    const obj = tagsDB.findOne({ $loki: id });
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) obj[newDataKey] = newData[newDataKey];

    res.send();
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
