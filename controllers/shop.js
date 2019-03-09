const ProductModel = require("../models/product")
const CartModel = require("../models/cart")

exports.getIndex = (req, res, next) => {
	res.status(200).render("shop/index", {
		docTitle: "Home",
		path: "/"
	})
}

exports.getViewProducts = (req, res, next) => {
	ProductModel.fetchAll(products => {
		res.status(200).render("shop/product", {
			products,
			docTitle: "Products",
			path: "/products"
		})
	})
}

exports.getProducts = (req, res, next) => {
	ProductModel.fetchAll(products => {
		res.status(200).render("shop/product", {
			products,
			docTitle: "Product page",
			path: "/products"
		})
	})
}

exports.getProductById = (req, res, next) => {
	ProductModel.findById(req.params.id, product => {
		res.status(200).render("shop/product-detail", {
			product,
			docTitle: "Product By ID page",
			path: "/products"
		})
	})
}

exports.getCart = (req, res, next) => {
	CartModel.fetchAll(cart => {
		ProductModel.fetchAll(products => {
			const cartProducts = [];
			for (product of products) {
				const data = cart.products.find(
					prod => prod.id === product.id
				);
				if (data) {
					cartProducts.push({ product, qty: data.qty });
				}
			}
			res.render('shop/cart', {
				path: '/cart',
				docTitle: 'Your Cart',
				products: cartProducts,
				totalPrice: cart.totalPrice
			});
		});
	});
};

exports.postCart = (req, res, next) => {
	ProductModel.findById(req.body.id, product => {
		CartModel.addToCart(req.body.id, product.price)
	})
	res.redirect("/products")
}

exports.getOrders = (req, res, next) => {
	res.status(200).render("shop/orders", {
		docTitle: "Your Orders",
		path: "/orders"
	})
}

exports.getCheckout = (req, res, next) => {
	res.status(200).render("shop/checkout", {
		docTitle: "Checkout",
		path: "/checkout"
	})
}
