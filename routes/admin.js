const express = require("express")
const router = express.Router()

const adminController = require("../controllers/admin")

// NOTE all route are prefixed with "/admin"
router.get("/add-product", adminController.getAddProduct)
router.post("/add-product", adminController.postAddProduct)

router.get("/products", adminController.getProducts)

router.get("/edit-product/:_id", adminController.getEditProduct)
router.post("/edit-product", adminController.postEditProduct)

router.post("/delete-product/:id", adminController.postDeleteProduct)

module.exports = router
