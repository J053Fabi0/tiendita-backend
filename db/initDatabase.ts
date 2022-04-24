import loki from "lokijs";
import { join } from "path";

const isTest = process.env.NODE_ENV === "test";
const lfsa = require("../utils/loki-fs-sync-adapter");

// Instanciarla.
const filename = isTest ? "test.db" : "database.db";
const db = new loki(join(__dirname, filename), { adapter: new lfsa() });

const autosave = () =>
  setTimeout(() => {
    db.saveDatabase((err) => {
      if (err) console.error(err);
      autosave();
    });
  }, 4_000);

if (!isTest) {
  autosave();

  // Cargar la base de datos síncronamente desde el archivo '*.db'.
  db.loadDatabase();

  console.log("Database loaded.");
}

export default db;
