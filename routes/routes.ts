import { Router } from "express";
import salesRoutes from "./salesRoutes";
import personsRoutes from "./personsRoutes";
import productsRoutes from "./productsRoutes";
import tagsAndCategoriesRoutes from "./tagsAndCategoriesRoutes";

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
