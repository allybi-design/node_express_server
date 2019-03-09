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
		if (err ) {
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
			if (this.id) {
				const Index = products.findIndex(product => product.id === this.id)
				const upDatedProducts = [...products]
				upDatedProducts[Index] = this
				fs.writeFile(filePath, JSON.stringify(upDatedProducts), err => {
					console.log(err)
				})
			} else {
				this.id = uuidv4()
				products.push(this)
				fs.writeFile(filePath, JSON.stringify(products), err => {
					console.log(err)
				})
			}
		})
	}

	static deleteByid(id) {
		readProductsFile(products => {
			const product = products.find(product => product.id === id)
			const upDatedProducts = products.filter(product => product.id != id)
			fs.writeFile(filePath, JSON.stringify(upDatedProducts), err => {
				if (!err) {
					CartModel.deleteByid(id, product.price)
				}
			})
		})
	}

	static fetchAll(ret) {
		readProductsFile(ret)
	}

	static findById(id, ret) {
		readProductsFile(products => {
      // ret(products.find(product => product.id === id))
      const product = products.find(prod => prod.id === id);
      ret(product);
		})
	}
}
