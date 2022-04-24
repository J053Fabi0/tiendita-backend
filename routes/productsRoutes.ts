import { Router } from "express";
import * as s from "../schemas/productsSchema";
import * as c from "../controllers/productsController";

const productsRoutes = Router();

productsRoutes.get("/product", s.getProduct, c.getProduct);
productsRoutes.get("/products", s.getProducts, c.getProducts);

productsRoutes.post("/product", s.postProduct, c.postProduct);

productsRoutes.delete("/product", s.deleteProduct, c.deleteProduct);

productsRoutes.patch("/product", s.patchProduct, c.patchProduct);

export default productsRoutes;
