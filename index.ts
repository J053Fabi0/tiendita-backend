import cors from "cors";
import { join } from "path";
import express from "express";
import * as dotenv from "dotenv";
import { usingCors } from "./utils/constants";

dotenv.config();
dotenv.config({ path: join(__dirname, "..", "/.env") });

if (process.env.API_SECRET === undefined && process.env.NODE_ENV !== "test")
  console.log("API_SECRET not set in .env."), process.exit(0);

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
const port = 3024;
app
  .listen(port, () => process.env.NODE_ENV === "test" || console.log(`Server on http://${address()}:${port}`))
  .on("error", (err: any) => process.env.NODE_ENV || console.log(err));

export default app;

//////////////////////////////////////////////////////////////
//////////////////// Save database on exit ///////////////////
//////////////////////////////////////////////////////////////
import db from "./db/initDatabase";
import customDeath from "./utils/customDeath";

customDeath(() =>
  db.saveDatabase((err: any) => {
    if (err) console.error(err);
    process.exit(0);
  })
);

import { personsDB } from "./db/collections/collections";
personsDB.clear({ removeIndices: true });
