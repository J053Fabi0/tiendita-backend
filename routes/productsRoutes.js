const router = require("express").Router();
const s = require("../schemas/productsSchema");
const c = require("../controllers/productsController");

router.get("/products", s.getProducts, c.getProducts);
router.get("/product", s.getProduct, c.getProduct);

router.post("/product", s.postProduct, c.postProduct);

// router.delete("/product", s.deleteProduct, c.deleteProduct);

// router.patch("/product", s.patchProduct, c.patchProduct);

module.exports = router;
