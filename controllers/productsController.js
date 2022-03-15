const handleError = require("../utils/handleError");
const { tagsDB, categoriesDB, productsDB } = require("../db/collections/collections");

const a = {};

a.postProduct = ({ body }, res) => {
  try {
    res.send({ message: productsDB.insertOne(body).$loki });
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
