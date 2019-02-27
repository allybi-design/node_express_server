const express = require("express");
const productsController = require("../controllers/products")
const router = express.Router();

router.get("/admin/add-product", productsController.getAddProduct);

router.post("/admin/redirect", productsController.postAddProduct);

module.exports = router;
