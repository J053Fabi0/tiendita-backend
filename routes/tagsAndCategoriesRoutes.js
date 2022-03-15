const router = require("express").Router();
const s = require("../schemas/tagsAndCategoriesSchema");
const c = require("../controllers/tagsAndCategoriesController");

router.get("/tags", c.getTags);

router.post("/category", s.postCategory, c.postCategory);
router.post("/tag", s.postTag, c.postTag);

router.delete("/category", s.deleteCategory, c.deleteCategory);
router.delete("/tag", s.deleteTag, c.deleteTag);

router.patch("/category", s.patchCategory, c.patchCategory);
router.patch("/tag", s.patchTag, c.patchTag);

module.exports = router;
