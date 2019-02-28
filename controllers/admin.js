const ProductModel = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.status(200).render("admin/add-product", {
    docTitle: "Add Product",
    activeAddProduct: true,
    path: "/admin/add-product"
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const description = req.body.description
  const price = req.body.price
  const product = new ProductModel(title, imageUrl, description, price);
  product.save();
  res.redirect("/");
};

exports.getProducts = (req, res, next) => {
  ProductCons.fetchAll(products => {
    res.status(200).render("admin/products", {
      products,
      docTitle: "Product page",
      path: "/products",
      activeShop: true
    });
  });
};

exports.getEditProduct = (req, res, next) => {
  res.status(200).render("admin/edit-product", {
    docTitle: "Admin/Edit Product",
    activeAddProduct: true,
    path: "/admin/edit-product"
  });
};