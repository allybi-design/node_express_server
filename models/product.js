const fs = require("fs")
const path = require("path")
const uuidv4 = require("uuid/v4")

const CartModel = require("../models/cart")

const filePath = path.join(
	path.dirname(process.mainModule.filename),
	"data",
	"products.json"
)

const readProductsFile = ret => {
	fs.readFile(filePath, (err, fileData) => {
		if (err) {
			ret([])
		} else {
			ret(JSON.parse(fileData))
		}
	})
}

const writeProductsFile = products => {
	fs.writeFile(filePath, JSON.stringify(products), err => {
		console.log(`ERROR: Could not write to file`)
	})
}

module.exports = class Product {
	constructor(id, title, imageUrl, description, price) {
		this.id = id
		this.title = title
		this.imageUrl = imageUrl
		this.description = description
		this.price = +price
	}

	save() {
		readProductsFile(products => {
			let productPriceDelta = 0
			if (this.id) {
				const Index = products.findIndex(product => product.id === this.id)
				const newProductPrice = this.price
				const oldProductPrice = products[Index].price
				productPriceDelta = newProductPrice - oldProductPrice
				products[Index] = this
				if (productPriceDelta != 0) {
					CartModel.updateProduct(this.id, productPriceDelta) //new method
				}
			} else {
				this.id = uuidv4()
				products.push(this)
			}
			writeProductsFile(products)
		})
	}


	static deleteByid(id) {
		readProductsFile(products => {
			const product = products.find(prod => prod.id === id)
			const newData = products.filter(prod => prod.id !== id)
			writeProductsFile(newData)
			CartModel.deleteByid(id, product.price)
		})
	}

	static fetchAll(ret) {
		readProductsFile(ret)
	}

	static findById(id, ret) {
		readProductsFile(products => {
			// ret(products.find(product => product.id === id))
			const product = products.find(prod => prod.id === id)
			ret(product)
		})
	}
}
