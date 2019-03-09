const ProductModel = require("../models/product")

//GET - Add Product
exports.getAddProduct = (req, res, next) => {
	res.status(200).render("admin/edit-product", {
		docTitle: "Add Product",
		path: "/admin/add-product",
		editing: false
	})
}

//POST- Add Product
exports.postAddProduct = (req, res, next) => {
	const title = req.body.title
	const imageUrl = req.body.imageUrl
	const description = req.body.description
	const price = req.body.price
	const product = new ProductModel(null, title, imageUrl, description, price)
	product.save()
	res.redirect("/admin/products")
}

exports.getProducts = (req, res, next) => {
	ProductModel.fetchAll(products => {
		if (!products) {
			return res.status(400).redirect("/")
		}
		res.status(200).render("admin/products", {
			docTitle: "Product",
			path: "/admin/product",
			products
		})
	})
}

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit
	if (!editMode) {
		return res.status(400).redirect("/")
	}
	ProductModel.findById(req.params.id, product => {
		if (!product) {
			console.log("No product found")
			return res.status(400).redirect("/")
		}
		res.status(200).render("admin/edit-product", {
			docTitle: "Edit Product",
			path: "/admin/edit-product",
			editing: editMode,
			product
		})
	})
}

exports.postEditProduct = (req, res, next) => {
	const upDatedProduct = new ProductModel(
		req.body.id,
		req.body.title,
		req.body.imageUrl,
		req.body.description,
		req.body.price
	)
	upDatedProduct.save()
	res.status(200).redirect("/admin/products")
}

exports.postDeleteProduct = (req, res, next) => {
	const editMode = req.query.edit
	if (!editMode) {
		return res.status(200).redirect("/admin/products")
	}
	ProductModel.deleteByid(req.body.id)
	
	res.status(200).redirect("/admin/products")
}
