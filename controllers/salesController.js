const handleError = require("../utils/handleError");
const { productsDB, salesDB } = require("../db/collections/collections");

const a = {};

a.getProducts = (_, res) => {
  try {
    res.send({ message: productsDB.find({}).map(({ meta: _, $loki: id, ...product }) => ({ ...product, id })) });
  } catch (e) {
    handleError(res, e);
  }
};

a.getSales = ({ body: { persons, products, tagsBehavior, tags, from } }, res) => {
  try {
    res.send({
      message: salesDB
        .chain()
        .find({ person: { $in: persons }, product: { $in: products }, date: { $gte: from } })
        .simplesort("date", { desc: true }) // los más recientes primero
        .data()
        .map(({ meta: _, $loki: id, ...sale }) => ({ id, ...sale })),
    });
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
