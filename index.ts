import cors from "cors";
import path from "node:path";
import express from "express";
import { join } from "node:path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { usingCors, port, frontendURL } from "./utils/constants.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: join(__dirname, "..", "/.env") });

if (Deno.env.get("API_SECRET")! === undefined && Deno.env.get("NODE_ENV")! !== "test")
  console.log("API_SECRET not set in .env."), Deno.exit(0);
if (Deno.env.get("BOT_TOKEN") === undefined && Deno.env.get("NODE_ENV")! !== "test")
  console.log("BOT_TOKEN not set in .env."), Deno.exit(0);

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

import router from "./routes/routes.ts";
app.use(router);

app
  .listen(
    port | 3024,
    () => Deno.env.get("NODE_ENV")! === "test" || console.log(`Server on http://localhost:${port | 3024}`)
  )
  .on("error", (err: any) => Deno.env.get("NODE_ENV")! || console.log(err));

export default app;

////////////////////////////////////////////////////////////////
//////////////////// Save database on exit /////////////////////
////////////////////////////////////////////////////////////////
import db from "./db/initDatabase.ts";
import customDeath from "./utils/customDeath.ts";

customDeath(() =>
  db.saveDatabase((err: any) => {
    if (err) console.error(err);
    Deno.exit(0);
  })
);
