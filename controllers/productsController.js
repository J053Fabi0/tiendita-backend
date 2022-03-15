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

a.postProduct = ({ body }, res) => {
  try {
    res.send({ message: productsDB.insertOne(body).$loki });
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
