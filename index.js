/*
 * Exrpess
 */
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = ["https://btc.josefabio.com"];
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

app.use(require("./routes"));

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
activateServer(3022);
