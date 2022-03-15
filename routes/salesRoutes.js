const router = require("express").Router();
const s = require("../schemas/salesSchema");
const c = require("../controllers/salesController");

router.get("/sales", s.getSales, c.getSales);

router.post("/newSale", s.postNewSale, c.postNewSale);

module.exports = router;
