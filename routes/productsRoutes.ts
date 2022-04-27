import { Router } from "express";
import * as s from "../schemas/productsSchema";
import * as c from "../controllers/productsController";
import { authJWTAllRoles, authJWTOnlyAdmins } from "../middlewares/authJWT";

const productsRoutes = Router();

// productsRoutes.get("/product", s.getProduct, c.getProduct);
productsRoutes.get("/products", authJWTAllRoles, s.getProducts, c.getProducts);

productsRoutes.post("/product", authJWTOnlyAdmins, s.postProduct, c.postProduct);

// productsRoutes.delete("/product", s.deleteProduct, c.deleteProduct);

// productsRoutes.patch("/product", s.patchProduct, c.patchProduct);

export default productsRoutes;
