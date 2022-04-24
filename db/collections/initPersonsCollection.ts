const initPersonsCollection = (db: Loki) => db.addCollection("persons", { indices: ["$loki", "name"] });

export default initPersonsCollection;
