const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop");
const mW = require("../middleware/mW");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:_id", shopController.getProductById);

router.get("/cart", mW.isAuth, shopController.getCart);
router.post("/cart", mW.isAuth, shopController.postCart);

router.get("/checkout", mW.isAuth, shopController.getCheckOut);

router.post("/delete-item", mW.isAuth, shopController.postItemCartDelete);

router.get("/orders", mW.isAuth, shopController.getOrders);

router.get("/invoice/:orderId", shopController.getInvoice);

module.exports = router;
