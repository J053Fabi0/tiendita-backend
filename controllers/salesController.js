const handleError = require("../utils/handleError");
const { productsDB, filtersDB, salesDB } = require("../db/collections/collections");

const a = {};

a.getProducts = (_, res) => {
  try {
    res.send({ message: productsDB.find({}).map(({ meta: _, $loki: id, ...product }) => ({ ...product, id })) });
  } catch (e) {
    handleError(res, e);
  }
};

a.getFilters = (_, res) => {
  try {
    res.send({ message: filtersDB.find({}).map(({ meta: _, $loki: id, ...filter }) => ({ ...filter, id })) });
  } catch (e) {
    handleError(res, e);
  }
};

a.postNewSale = ({ body: { sales, person, date } }, res) => {
  try {
    for (const sale of sales) salesDB.insertOne({ person, date, ...sale });
    res.status(200).send();
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
