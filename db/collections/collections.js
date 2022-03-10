const initializeSales = require("./initSalesCollection");
const initializePersons = require("./initPersonsCollection");
const initializeFilters = require("./initFiltersCollection");
const initializeProducts = require("./initProductsCollection");
const db = require("../initDatabase");

// Declarar las colecciones.
const collections = [
  { name: "sales", initializer: initializeSales },
  { name: "persons", initializer: initializePersons },
  { name: "filters", initializer: initializeFilters },
  { name: "products", initializer: initializeProducts },
];

// Inicializar las colleciones si no existen.
for (const { name, initializer = () => 1 } of collections) if (!db.getCollection(name)) initializer(db);

// Exportarlas manualmente, para que sean visibles en los require.
module.exports.salesDB = db.getCollection("sales");
module.exports.personsDB = db.getCollection("persons");
module.exports.filtersDB = db.getCollection("filters");
module.exports.productsDB = db.getCollection("products");
