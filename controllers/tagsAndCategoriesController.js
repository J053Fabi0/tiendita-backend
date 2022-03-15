const handleError = require("../utils/handleError");
const { tagsDB } = require("../db/collections/collections");

const a = {};

a.postTags = (_, res) => {
  try {
    const tags = tagsDB.find({}).map(({ meta: _, $loki: id, ...tags }) => ({ ...tags, id }));

    res.send({ message: tags });
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = a;
