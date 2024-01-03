import loki from "lokijs";
import { join } from "path";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lfsa from "../utils/loki-fs-sync-adapter.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isTest = Deno.env.get("NODE_ENV")! === "test";
// const lfsa = require("../utils/loki-fs-sync-adapter");

// Instanciarla.
const filename = isTest ? "test.db" : "database.db";
const db = new loki(join(__dirname, filename), { adapter: lfsa });

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
