const handleError = require("../utils/handleError");
const { tagsDB, categoriesDB } = require("../db/collections/collections");

const a = {};

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

module.exports = a;
