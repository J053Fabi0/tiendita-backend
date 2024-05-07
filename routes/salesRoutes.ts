import { Router } from "express";
import * as s from "../schemas/salesSchema.ts";
import * as c from "../controllers/salesController.ts";
import { authAllRoles, authOnlyAdmins } from "../middlewares/authJWT.ts";

const salesRoutes = Router();

salesRoutes.get("/sales", authOnlyAdmins, s.getSales, c.getSales);
salesRoutes.get("/sale", authOnlyAdmins, s.getSale, c.getSale);

salesRoutes.post("/sale", authAllRoles, s.postSale, c.postSale);

// salesRoutes.patch("/sale", s.patchSale, c.patchSale);

salesRoutes.delete("/sale", authOnlyAdmins, s.deleteSale, c.deleteSale);

export default salesRoutes;
