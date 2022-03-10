/*
 * Exrpess
 */
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = ["https://tiendita.josefabio.com"];
app.use(
  require("./utils/constants").usingCors
    ? require("cors")({
        origin: function (origin, callback) {
          if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
      })
    : require("cors")()
);

app.use(require("./routes/routes.js"));

const { address } = require("ip");
const activateServer = (port) =>
  app
    .listen(port, () => console.log(`Server on http://${address()}:${port}`))
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log("Error EADDRINUSE on port " + port);
        activateServer(port + 1);
      }
    });
activateServer(3023);

// const { productsDB, filtersDB, personsDB, salesDB } = require("./db/collections/collections");

// console.log(salesDB.find({}));

// personsDB.insertOne({ name: "Jose Fabio" });

// filtersDB.insertOne({ name: "Vestido" });

// productsDB.insertOne({
//   name: "Producto 1",
//   price: 1.99,
//   stock: 10,
//   filters: [0],
//   description: "Esta es una pequeña descripción.",
// });
