const initTagsCollection = (db: Loki) => db.addCollection("tags", { indices: ["$loki", "category"] });

export default initTagsCollection;
