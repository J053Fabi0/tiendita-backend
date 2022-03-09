const router = require("express").Router();

const c = require("../controllers/shieldController");
const shieldSchema = require("../schemas/shieldSchema");

router.get("/shieldaddress", shieldSchema, c.getShieldAddress);
router.get("/acceptedcoins", c.getAcceptedCoins);

module.exports = router;
