import { Router } from "express";
import * as s from "../schemas/tagsAndCategoriesSchema.ts";
import * as c from "../controllers/tagsAndCategoriesController.ts";
import { authAllRoles, authOnlyAdmins } from "../middlewares/authJWT.ts";

const tagsAndCategoriesRoutes = Router();

tagsAndCategoriesRoutes.get("/tags", authAllRoles, c.getTags);

tagsAndCategoriesRoutes.post("/tag", authOnlyAdmins, s.postTag, c.postTag);
tagsAndCategoriesRoutes.post("/category", authOnlyAdmins, s.postCategory, c.postCategory);

// tagsAndCategoriesRoutes.delete("/tag", s.deleteTag, c.deleteTag);
// tagsAndCategoriesRoutes.delete("/category", s.deleteCategory, c.deleteCategory);

// tagsAndCategoriesRoutes.patch("/tag", s.patchTag, c.patchTag);
// tagsAndCategoriesRoutes.patch("/category", s.patchCategory, c.patchCategory);

export default tagsAndCategoriesRoutes;
