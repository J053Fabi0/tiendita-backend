const router = require("express").Router();

router.get("/", (_, res) => res.send().status(200));

router.use(require("./salesRoutes"));
router.use(require("./productsRoutes"));
router.use(require("./tagsAndCategoriesRoutes"));

module.exports = router;
