const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop");
const mW = require("../middleware/mW");

router.get("/products", shopController.getProducts);

router.get("/product/:id", shopController.getProductById);

router.post("/addItemToCart", shopController.postAddItemToCart);

router.post("/deleteItemInCart", shopController.postDeleteItemInCart);

router.post("/incItemQty", shopController.postIncItemQty);

router.post("/decItemQty", shopController.postDecItemQty);

// router.get("/checkout", shopController.getCheckOut);

// router.get("/orders", shopController.getOrders);

// router.get("/invoice/:orderId", shopController.getInvoice);

module.exports = router;
