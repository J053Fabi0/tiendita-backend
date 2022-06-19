import cors from "cors";
import { join } from "path";
import express from "express";
import * as dotenv from "dotenv";
import { usingCors, port, frontendURL } from "./utils/constants";

dotenv.config();
dotenv.config({ path: join(__dirname, "..", "/.env") });

if (process.env.API_SECRET === undefined && process.env.NODE_ENV !== "test")
  console.log("API_SECRET not set in .env."), process.exit(0);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = [frontendURL];
app.use(
  usingCors
    ? cors({
        origin: (origin, callback) =>
          !origin || whitelist.indexOf(origin) !== -1
            ? callback(null, true)
            : callback(new Error("Not allowed by CORS")),
      })
    : cors()
);

import router from "./routes/routes";
app.use(router);

import { address } from "ip";
app
  .listen(
    port | 3024,
    () => process.env.NODE_ENV === "test" || console.log(`Server on http://${address()}:${port | 3024}`)
  )
  .on("error", (err: any) => process.env.NODE_ENV || console.log(err));

export default app;

////////////////////////////////////////////////////////////////
//////////////////// Save database on exit /////////////////////
////////////////////////////////////////////////////////////////
import db from "./db/initDatabase";
import customDeath from "./utils/customDeath";

customDeath(() =>
  db.saveDatabase((err: any) => {
    if (err) console.error(err);
    process.exit(0);
  })
);
