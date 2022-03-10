module.exports = (db) => db.addCollection("persons", { indices: ["$loki", "name"] });
