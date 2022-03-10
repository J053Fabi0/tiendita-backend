const loki = require("lokijs");
const lfsa = require("../node_modules/lokijs/src/loki-fs-sync-adapter");

// Instanciarla.
const db = new loki("./db/database.db", { adapter: new lfsa() });

const { autosaveInterval } = require("../utils/constants");
const autosave = () =>
  setTimeout(() => {
    db.saveDatabase((err) => {
      if (err) console.error(err);
      autosave();
    });
  }, 4_000);
autosave();

// Cargar la base de datos síncronamente desde el archivo '*.db'.
db.loadDatabase();

console.log("Database loaded.");

module.exports = db;
