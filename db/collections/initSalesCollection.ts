const initSalesCollection = (db: Loki) =>
  db.addCollection("sales", { indices: ["person", "product", "$loki", "enabled"] });

export default initSalesCollection;
