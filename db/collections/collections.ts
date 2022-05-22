import db from "../initDatabase";
import initTagsCollection from "./initTagsCollection";
import initSalesCollection from "./initSalesCollection";
import initPersonsCollection from "./initPersonsCollection";
import initProductsCollection from "./initProductsCollection";
import initCategoriesCollection from "./initCategoriesCollection";

import TagsDB from "../../types/collections/tagsDB.type";
import SalesDB from "../../types/collections/salesDB.type";
import PersonsDB from "../../types/collections/personsDB.type";
import ProductsDB from "../../types/collections/productsDB.type";
import CategoriesDB from "../../types/collections/categoriesDB.type";

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
