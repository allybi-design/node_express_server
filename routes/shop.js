const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop");
const userController = require("../controllers/user");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:_id", shopController.getProductById);

router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);

router.post("/delete-item", shopController.postItemCartDelete);

router.get("/orders", shopController.getOrders);
router.post("/orders", shopController.postAddOrder);

// router.get("/user/log-in", userController.getUserLogIn);
// router.post("/user/log-in", userController.postUserLogIn);

// router.get("/log-out", userController.getUserLogOut);

// router.get("/user/register", userController.getUserRegister);
// router.post("/user/register", userController.postUserRegister);

module.exports = router;
