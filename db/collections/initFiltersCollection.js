module.exports = (db) => db.addCollection("filters", { indices: ["$loki"] });
