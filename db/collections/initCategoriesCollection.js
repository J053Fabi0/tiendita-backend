module.exports = (db) => db.addCollection("categories", { indices: ["$loki"] });
