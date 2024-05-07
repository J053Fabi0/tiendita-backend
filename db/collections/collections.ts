import db from "../initDatabase.ts";
import initTagsCollection from "./initTagsCollection.ts";
import initSalesCollection from "./initSalesCollection.ts";
import initPersonsCollection from "./initPersonsCollection.ts";
import initProductsCollection from "./initProductsCollection.ts";
import initCategoriesCollection from "./initCategoriesCollection.ts";

import TagsDB from "../../types/collections/tagsDB.type.ts";
import SalesDB from "../../types/collections/salesDB.type.ts";
import PersonsDB from "../../types/collections/personsDB.type.ts";
import ProductsDB from "../../types/collections/productsDB.type.ts";
import CategoriesDB from "../../types/collections/categoriesDB.type.ts";

// Declarar las colecciones.
const collectionsInits: { name: string; initializer: (db: Loki) => Collection<any> }[] = [
  { name: "tags", initializer: initTagsCollection },
  { name: "sales", initializer: initSalesCollection },
  { name: "persons", initializer: initPersonsCollection },
  { name: "products", initializer: initProductsCollection },
  { name: "categories", initializer: initCategoriesCollection },
];

// Inicializar las colleciones si no existen.
for (const { name, initializer } of collectionsInits) if (db.getCollection(name) === null) initializer(db);

// Exportarlas manualmente, para que sean visibles en los require.
export const tagsDB = db.getCollection<TagsDB>("tags");
export const salesDB = db.getCollection<SalesDB>("sales");
export const personsDB = db.getCollection<PersonsDB>("persons");
export const productsDB = db.getCollection<ProductsDB>("products");
export const categoriesDB = db.getCollection<CategoriesDB>("categories");
