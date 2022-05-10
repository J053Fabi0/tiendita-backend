import { Router } from "express";
import * as s from "../schemas/salesSchema";
import * as c from "../controllers/salesController";
import { authAllRoles, authOnlyAdmins } from "../middlewares/authJWT";

const salesRoutes = Router();

salesRoutes.get("/sales", authOnlyAdmins, s.getSales, c.getSales);
// salesRoutes.get("/sale", s.getSale, c.getSale);

salesRoutes.post("/sale", authAllRoles, s.postSale, c.postSale);

// salesRoutes.patch("/sale", s.patchSale, c.patchSale);

// salesRoutes.delete("/sale", s.deleteSale, c.deleteSale);

export default salesRoutes;
