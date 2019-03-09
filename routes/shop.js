const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop")

router.get("/", shopController.getIndex);

router.get("/products", shopController.getViewProducts)

router.get("/products/:id", shopController.getProductById)

router.get("/cart", shopController.getCart )
router.post("/cart", shopController.postCart)

router.get("/orders", shopController.getOrders)

router.get("/checkout", shopController.getCheckout)

module.exports = router;
