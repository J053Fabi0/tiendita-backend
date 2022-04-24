import cors from "cors";
import express from "express";
import { usingCors } from "./utils/constants";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = ["https://tiendita.josefabio.com"];
app.use(
  usingCors
    ? cors({
        origin: function (origin, callback) {
          if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
      })
    : cors()
);

import router from "./routes/routes";
app.use(router);

import { address } from "ip";
app
  .listen(3023, () => process.env.NODE_ENV === "test" || console.log(`Server on http://${address()}:${3023}`))
  .on("error", (err: any) => process.env.NODE_ENV || console.log(err));

export default app;

//////////////////////////////////////////////////////////
//////////////////// Save database on exit ///////////////
//////////////////////////////////////////////////////////
import db from "./db/initDatabase";
import customDeath from "./utils/customDeath";

customDeath(() =>
  db.saveDatabase((err: any) => {
    if (err) console.error(err);
    process.exit(0);
  })
);
