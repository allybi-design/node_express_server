const fs = require("fs")
const path = require("path")

const filePath = path.join(
	path.dirname(process.mainModule.filename),
	"data",
	"cart.json"
)

const readCartFile = ret => {
	fs.readFile(filePath, (err, fileData) => {
		if (err || fileData.length === 0) {
			ret({ products: [], totalPrice: 0 })
		} else {
			ret(JSON.parse(fileData))
		}
	})
}

const writeCartFile = cart => {
	fs.writeFile(filePath, JSON.stringify(cart), err => {
		if (err) {
			console.log(`ERROR: Could not write to file - Cart`)
			return
		}
	})
}

module.exports = class Cart {
	static addToCart(id, productPrice) {
		// Fetch the previous cart
		readCartFile(cart => {
			// Analyze the cart => Find existing product
			const Index = cart.products.findIndex(product => product.id === id)
			const existingProduct = cart.products[Index]
			let updatedProduct
			// Add new product/ increase quantity
			if (existingProduct) {
				updatedProduct = { ...existingProduct }
				updatedProduct.qty++
				cart.products = [...cart.products]
				cart.products[Index] = updatedProduct
			} else {
				updatedProduct = { id: id, qty: 1 }
				cart.products = [...cart.products, updatedProduct]
			}
			cart.totalPrice = cart.totalPrice + +productPrice
			writeCartFile(cart, err => {
				console.log(err)
			})
		})
	}

	static updateProduct(id, productPriceDelta) {
		readCartFile(cart => {
			const Index = cart.products.findIndex(prod => prod.id === id)
			const product = cart.products[Index]
			if (product) {
				const productQty = product.qty
				cart.totalPrice = +(
					cart.totalPrice +
					productPriceDelta * productQty
				).toFixed(2)
				writeCartFile(cart)
			}
		})
	}

	static deleteByid(id, productPrice) {
		readCartFile(cart => {
			const product = cart.products.find(product => product.id === id)
			if (!product) {
				return
			}
			const productQty = product.qty
			cart.products = cart.products.filter(prod => prod.id !== id)
			cart.totalPrice = cart.totalPrice - +productPrice * +productQty
			writeCartFile(cart)
		})
	}

	static fetchAll(ret) {
		readCartFile(ret)
	}
}
