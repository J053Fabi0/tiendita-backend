const handleError = require("../utils/handleError");
const { salesDB, productsDB } = require("../db/collections/collections");

const a = {};

a.getSales = ({ body: { persons, products, tagsBehavior, tags, from, enabled } }, res) => {
  try {
    res.send({
      message: salesDB
        .chain()
        .find({ enabled })
        .find({ date: { $gte: from } })
        .find({ person: { $in: persons }, product: { $in: products } })
        .simplesort("date", { desc: true }) // los más recientes primero
        .data()
        .map(({ meta: _, enabled: __, $loki: id, ...sale }) => ({ id, ...sale }))
        .filter(({ product }) => {
          // If the tags are -1, then there shouldn't be any tag filtering at all.
          if (tags === -1) return true;

          const productTags = productsDB.findOne({ $loki: product }).tags;

          if (tagsBehavior === "AND") {
            for (const tag of tags) if (!productTags.includes(tag)) return false;
            return true;
          } else {
            for (const tag of tags) if (productTags.includes(tag)) return true;
            return false;
          }
        }),
    });
  } catch (e) {
    handleError(res, e);
  }
};

a.getSale = ({ body: { id } }, res) => {
  try {
    const { meta: _, $loki, ...data } = salesDB.findOne(id);
    res.status(200).send({ message: { id: $loki, ...data } });
  } catch (e) {
    handleError(res, e);
  }
};

a.postSale = ({ body }, res) => {
  try {
    const { $loki } = salesDB.insertOne(body);
    res.status(200).send({ message: { id: $loki } });
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
