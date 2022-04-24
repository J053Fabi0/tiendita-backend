import * as collections from "../db/collections/collections";

export const whipeData = () => {
  const DBs = Object.values(collections);
  for (const db of DBs) db.clear({ removeIndices: true });
};
