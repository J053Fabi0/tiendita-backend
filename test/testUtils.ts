import { personsDB } from "../db/collections/collections.ts";
import PersonsDB from "../types/collections/personsDB.type.ts";
import * as collections from "../db/collections/collections.ts";

export const whipeData = () => {
  const DBs = Object.values(collections);
  for (const db of DBs) db.clear({ removeIndices: true });
};

/**
 * admin will have id 1, and employee id 2.
 */
export const addAdminAndEmployee = () =>
  personsDB.insert([
    ...[
      { enabled: true, role: "admin", name: "admin", password: "admin", username: "admin" } as PersonsDB,
      {
        enabled: true,
        role: "employee",
        name: "employee",
        password: "employee",
        username: "employee",
      } as PersonsDB,
    ],
  ]);
