import { Router } from "express";
import salesRoutes from "./salesRoutes.ts";
import personsRoutes from "./personsRoutes.ts";
import productsRoutes from "./productsRoutes.ts";
import tagsAndCategoriesRoutes from "./tagsAndCategoriesRoutes.ts";

const router = Router();

// Default response.
router.get("/", (_, res) => res.send().status(200));

router.use(
  salesRoutes,
  personsRoutes,
  productsRoutes, //
  tagsAndCategoriesRoutes
);

export default router;
