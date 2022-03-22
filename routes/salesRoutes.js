const router = require("express").Router();
const s = require("../schemas/salesSchema");
const c = require("../controllers/salesController");

// router.get("/sales", s.getSales, c.getSales);
router.get("/sale", s.getSale, c.getSale);

router.post("/sale", s.postSale, c.postSale);

module.exports = router;
