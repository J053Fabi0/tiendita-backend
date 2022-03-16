const collections = require("../db/collections/collections");

module.exports.whipeData = () => {
  const DBs = Object.values(collections);
  for (const db of DBs) db.clear({ removeIndices: true });
};
