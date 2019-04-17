const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop");
const mW = require("../middleware/mW");

router.get("/products", shopController.getProducts);

router.get("/product/:id", shopController.getProductById);

router.post("/cart", shopController.postAddToCart);

// router.get("/checkout", shopController.getCheckOut);

// router.post("/delete-item", shopController.postItemCartDelete);

// router.get("/orders", shopController.getOrders);

// router.get("/invoice/:orderId", shopController.getInvoice);

module.exports = router;
