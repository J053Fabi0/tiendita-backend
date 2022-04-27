import { personsDB } from "../db/collections/collections";
import PersonsDB from "../types/collections/personsDB.type";
import * as collections from "../db/collections/collections";

export const whipeData = () => {
  const DBs = Object.values(collections);
  for (const db of DBs) db.clear({ removeIndices: true });
};

export const addAdminAndEmployee = () =>
  personsDB.insert([
    ...[{ enabled: true, role: "admin" } as PersonsDB, { enabled: true, role: "employee" } as PersonsDB],
  ]);
