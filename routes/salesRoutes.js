const router = require("express").Router();
const c = require("../controllers/salesController");
const s = require("../schemas/salesSchema");

router.get("/products", c.getProducts);
router.get("/filters", c.getFilters);

router.post("/newSale", s.postNewSale, c.postNewSale);

module.exports = router;
