const initCategoriesCollection = (db: Loki) => db.addCollection("categories", { indices: ["$loki"] });

export default initCategoriesCollection;
