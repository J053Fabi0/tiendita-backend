const handleError = require("../utils/handleError");
const { tagsDB, categoriesDB } = require("../db/collections/collections");

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

a.deleteCategory = ({ body: { id } }, res) => {
  try {
    categoriesDB.findAndRemove({ $loki: id });
    tagsDB.findAndRemove({ category: id });
    res.send().status(204);
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
