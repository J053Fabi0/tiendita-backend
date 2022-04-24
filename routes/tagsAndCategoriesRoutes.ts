import { Router } from "express";
import * as s from "../schemas/tagsAndCategoriesSchema";
import * as c from "../controllers/tagsAndCategoriesController";

const tagsAndCategoriesRoutes = Router();

tagsAndCategoriesRoutes.get("/tags", c.getTags);

tagsAndCategoriesRoutes.post("/tag", s.postTag, c.postTag);
tagsAndCategoriesRoutes.post("/category", s.postCategory, c.postCategory);

tagsAndCategoriesRoutes.delete("/tag", s.deleteTag, c.deleteTag);
tagsAndCategoriesRoutes.delete("/category", s.deleteCategory, c.deleteCategory);

tagsAndCategoriesRoutes.patch("/tag", s.patchTag, c.patchTag);
tagsAndCategoriesRoutes.patch("/category", s.patchCategory, c.patchCategory);

export default tagsAndCategoriesRoutes;
