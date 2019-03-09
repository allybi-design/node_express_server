const fs = require("fs")
const path = require("path")

const filePath = path.join(
	path.dirname(process.mainModule.filename),
	"data",
	"cart.json"
)

const readCartFile = ret => {
	fs.readFile(filePath, (err, fileData) => {
		if (err) {
			ret([])
		} else {
			ret(JSON.parse(fileData))
		}
	})
}

const writeCart = items => {
	fs.writeFile(filePath, JSON.stringify(items), err => {
		if (err) {
			console.log(`ERROR: Could not write to file - Cart`)
			return
		}
	})
}

module.exports = class Cart {
	static addToCart(id, productPrice) {
		// Fetch the previous cart
		fs.readFile(filePath, (err, fileContent) => {
			let cart = { products: [], totalPrice: 0 }
			if (!err) {
				cart = JSON.parse(fileContent)
			}
			// Analyze the cart => Find existing product
			const existingProductIndex = cart.products.findIndex(
				prod => prod.id === id
			)
			const existingProduct = cart.products[existingProductIndex]
			let updatedProduct
			// Add new product/ increase quantity
			if (existingProduct) {
				updatedProduct = { ...existingProduct }
				updatedProduct.qty = updatedProduct.qty + 1
				cart.products = [...cart.products]
				cart.products[existingProductIndex] = updatedProduct
			} else {
				updatedProduct = { id: id, qty: 1 }
				cart.products = [...cart.products, updatedProduct]
			}
			cart.totalPrice = cart.totalPrice + +productPrice
			fs.writeFile(filePath, JSON.stringify(cart), err => {
				console.log(err)
			})
		})
	}

	// static deleteByid(id, price) {
	// 	readCartFile(cart => {
	// 		console.log("read cart")
	// 		const upDatedCart = { ...cart }
	// 		const product = upDatedCart.products.find(product => product.id === id)
	// 		if (!product) {
	// 			return
	// 		}
	// 		upDatedCart.totalPrice -= price * product.qty
	// 		upDatedCart.products = upDatedCart.products.filter(
	// 			product => product.id !== id
	// 		)
	// 		fs.writeFile(filePath, JSON.stringify(upDatedCart), err => {
	// 			if (err) {
	// 				console.log(`ERROR: ${err}`)
	// 			}
	// 		})
	// 	})
	// }

	static deleteByid(id, productPrice) {
		fs.readFile(filePath, (err, fileContent) => {
			if (err) {
				return;
			}
			const updatedCart = { ...JSON.parse(fileContent) };
			const product = updatedCart.products.find(prod => prod.id === id);
			const productQty = product.qty;
			updatedCart.products = updatedCart.products.filter(
				prod => prod.id !== id
			);
			updatedCart.totalPrice =
				updatedCart.totalPrice - productPrice * productQty;

			fs.writeFile(filePath, JSON.stringify(updatedCart), err => {
				console.log(err);
			});
		});
	}

	static fetchAll(ret) {
		readCartFile(ret)
	}
}
