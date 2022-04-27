import { Router } from "express";
import * as s from "../schemas/tagsAndCategoriesSchema";
import * as c from "../controllers/tagsAndCategoriesController";
import { authJWTAllRoles, authJWTOnlyAdmins } from "../middlewares/authJWT";

const tagsAndCategoriesRoutes = Router();

tagsAndCategoriesRoutes.get("/tags", authJWTAllRoles, c.getTags);

tagsAndCategoriesRoutes.post("/tag", authJWTOnlyAdmins, s.postTag, c.postTag);
tagsAndCategoriesRoutes.post("/category", authJWTOnlyAdmins, s.postCategory, c.postCategory);

// tagsAndCategoriesRoutes.delete("/tag", s.deleteTag, c.deleteTag);
// tagsAndCategoriesRoutes.delete("/category", s.deleteCategory, c.deleteCategory);

// tagsAndCategoriesRoutes.patch("/tag", s.patchTag, c.patchTag);
// tagsAndCategoriesRoutes.patch("/category", s.patchCategory, c.patchCategory);

export default tagsAndCategoriesRoutes;
