const validateRequest = require("../utils/validateRequest");

module.exports = {
  validIDs:
    (db) =>
    (id, { error }) => {
      const valids = db.find({}).map(({ $loki }) => $loki);
      return valids.includes(id) ? id : error("any.only", { valids });
    },

  a:
    (schema, element = undefined) =>
    (req, res, next) =>
      validateRequest(req, res, next, schema, element),
};
