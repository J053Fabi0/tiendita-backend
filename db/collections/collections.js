const db = require("../initDatabase");
const initializeTags = require("./initTagsCollection");
const initializeSales = require("./initSalesCollection");
const initializePersons = require("./initPersonsCollection");
const initializeProducts = require("./initProductsCollection");
const initializeCategories = require("./initCategoriesCollection");

// Declarar las colecciones.
const collections = [
  { name: "tags", initializer: initializeTags },
  { name: "sales", initializer: initializeSales },
  { name: "persons", initializer: initializePersons },
  { name: "products", initializer: initializeProducts },
  { name: "categories", initializer: initializeCategories },
];

// Inicializar las colleciones si no existen.
for (const { name, initializer = () => 1 } of collections) if (!db.getCollection(name)) initializer(db);

// Exportarlas manualmente, para que sean visibles en los require.
module.exports.tagsDB = db.getCollection("tags");
module.exports.salesDB = db.getCollection("sales");
module.exports.personsDB = db.getCollection("persons");
module.exports.productsDB = db.getCollection("products");
module.exports.categoriesDB = db.getCollection("categories");
