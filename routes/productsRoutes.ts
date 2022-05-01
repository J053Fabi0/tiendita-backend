import { Router } from "express";
import * as s from "../schemas/productsSchema";
import * as c from "../controllers/productsController";
import { authAllRoles, authOnlyAdmins } from "../middlewares/authJWT";

const productsRoutes = Router();

productsRoutes.get("/product", authAllRoles, s.getProduct, c.getProduct);
productsRoutes.get("/products", authAllRoles, s.getProducts, c.getProducts);

productsRoutes.post("/product", authOnlyAdmins, s.postProduct, c.postProduct);

productsRoutes.delete("/product", authOnlyAdmins, s.deleteProduct, c.deleteProduct);

productsRoutes.patch("/product", authOnlyAdmins, s.patchProduct, c.patchProduct);

export default productsRoutes;
