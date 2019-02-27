const ProductCons = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.status(200).render("add-product", {
    docTitle: "Add Product",
    activeAddProduct: true,
    path: "/admin/add-product"
  });
};

exports.postAddProduct = (req, res, next) => {
  const product = new ProductCons(req.body.title);
  product.save();
  res.redirect("/");
};

exports.getProducts = (req, res, next) => {
  ProductCons.fetchAll(products => {
    res.status(200).render("shop", {
      products,
      docTitle: "Shop",
      path: "/admin/shop",
      activeShop: true
    });
  });
};
