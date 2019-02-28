const fs = require("fs");
const path = require("path");

const filePath = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

const getProducts = ret => {
  fs.readFile(filePath, (err, fileData) => {
    if (err || fileData.length === 0) {
      ret([]);
    } else {
      ret(JSON.parse(fileData));
    }
  });
};

const setProducts = products => {
  fs.writeFile(filePath, JSON.stringify(products), err => {
    console.log(`ERROR: Could not write to file`);
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl,
    this.description = description,
    this.price = price
  }

  save() {
    getProducts(products => {
      products.push(this);
      setProducts(products);
    });
  }

  static fetchAll(ret) {
    getProducts(ret);
  }
};
