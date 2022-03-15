module.exports = (db) => db.addCollection("products", { indices: ["stock", "$loki", "enabled", "tags"] });
