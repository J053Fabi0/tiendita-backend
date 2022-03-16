const loki = require("lokijs");
const lfsa = require("../node_modules/lokijs/src/loki-fs-sync-adapter");

// Instanciarla.
const filename = process.env.NODE_ENV === "test" ? "test.db" : "database.db";
const db = new loki(require("path").join(__dirname, filename), { adapter: new lfsa() });

const autosave = () =>
  setTimeout(() => {
    db.saveDatabase((err) => {
      if (err) console.error(err);
      autosave();
    });
  }, 4_000);

if (process.env.NODE_ENV !== "test") {
  autosave();

  // Cargar la base de datos síncronamente desde el archivo '*.db'.
  db.loadDatabase();

  console.log("Database loaded.");
}

module.exports = db;
