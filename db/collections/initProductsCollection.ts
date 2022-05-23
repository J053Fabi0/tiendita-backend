const initProductsCollection = (db: Loki) =>
  db.addCollection("products", { indices: ["stock", "$loki", "enabled", "tags"] });

export default initProductsCollection;
