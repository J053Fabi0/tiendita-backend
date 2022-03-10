const router = require("express").Router();

router.use("/", require("./salesRoutes"));

module.exports = router;
