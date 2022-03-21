const handleError = require("../utils/handleError");
const { salesDB } = require("../db/collections/collections");

const a = {};

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

a.postSale = ({ body }, res) => {
  try {
    const { $loki } = salesDB.insertOne({});
    res.status(200).send({ message: { id: $loki } });
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
