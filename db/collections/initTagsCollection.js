module.exports = (db) => db.addCollection("tags", { indices: ["$loki", "category"] });
