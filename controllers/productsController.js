const handleError = require("../utils/handleError");
const { tagsDB, categoriesDB, productsDB } = require("../db/collections/collections");

const a = {};

a.getProducts = ({ body: { enabled } }, res) => {
  try {
    res.send({
      message: productsDB.find({ enabled }).map(({ meta: _, $loki: id, ...data }) => ({ id, ...data })),
    });
  } catch (e) {
    handleError(res, e);
  }
};

a.getProduct = ({ body: { id } }, res) => {
  try {
    res.send({
      message: productsDB.find({ $loki: id }).map(({ meta: _, $loki: id, ...data }) => ({ id, ...data }))[0],
    });
  } catch (e) {
    handleError(res, e);
  }
};

a.postProduct = ({ body }, res) => {
  try {
    res.send({ message: productsDB.insertOne(body).$loki });
  } catch (e) {
    handleError(res, e);
  }
};

a.patchProduct = ({ body: { id, deleteTags, addTags, ...newData } }, res) => {
  try {
    const obj = productsDB.findOne({ $loki: id });
    const newDataKeys = Object.keys(newData);
    for (const newDataKey of newDataKeys) obj[newDataKey] = newData[newDataKey];

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

    res.send().status(200);
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
