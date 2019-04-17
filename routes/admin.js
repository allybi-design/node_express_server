const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const mW = require("../middleware/mW");

// NOTE all route are prefixed with "/admin"
// router.get("/add-product", mW.isAuth, adminController.getAddProduct);
// router.post(
//   "/add-product",
//   mW.isAuth,
//   mW.validateProduct,
//   adminController.postAddProduct
// );

// router.get("/products", mW.isAuth, adminController.getProducts);

// router.get("/edit-product/:_id", mW.isAuth, adminController.getEditProduct);
// router.post(
//   "/edit-product",
//   mW.isAuth,
//   mW.validateProduct,
//   adminController.postEditProduct
// );

// router.delete(
//   "/delete-product/:productId",
//   mW.isAuth,
//   adminController.deleteProduct
// );

module.exports = router;
