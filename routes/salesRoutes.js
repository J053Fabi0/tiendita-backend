const router = require("express").Router();
const s = require("../schemas/salesSchema");
const c = require("../controllers/salesController");

// router.get("/sales", s.getSales, c.getSales);

router.post("/sale", s.postSale, c.postSale);

module.exports = router;
