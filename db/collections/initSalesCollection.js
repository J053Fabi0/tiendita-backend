module.exports = (db) => db.addCollection("sales", { indices: ["person", "product", "$loki"] });
