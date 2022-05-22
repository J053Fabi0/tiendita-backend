const initProductsCollection = (db: Loki) => {
  let productsDB = db.getCollection("products");
  if (productsDB === null)
    productsDB = db.addCollection("products", { indices: ["stock", "$loki", "enabled", "tags"] });

  productsDB.checkAllIndexes({ repair: true });

  return productsDB;
};

export default initProductsCollection;
