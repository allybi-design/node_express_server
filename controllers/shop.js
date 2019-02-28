const ProductCons = require("../models/product");

exports.getIndex = (req, res, next) => {
  ProductCons.fetchAll(products => {
    res.status(200).render("shop/index", {
      products,
      docTitle: "Home",
      path: "/",
      activeShop: true
    });
  });
};

exports.getProducts = (req, res, next) => {
  ProductCons.fetchAll(products => {
    res.status(200).render("shop/product", {
      products,
      docTitle: "Product page",
      path: "/products",
      activeShop: true
    });
  });
};

exports.getViewProducts = (req, res, next) => {
  ProductCons.fetchAll(products => {
    res.status(200).render("shop/product", {
      products,
      docTitle: "Products",
      path: "/products",
      activeShop: true
    });
  });
};

exports.getCart = (req, res, next) => {
  ProductCons.fetchAll(products => {
    res.status(200).render("shop/cart", {
      products,
      docTitle: "Cart",
      path: "/cart",
      activeShop: true
    });
  });
};

exports.getCheckout = (req, res, next) =>
  res.status(200).render("shop/checkout", {
    docTitle: "Checkout",
    path: "/checkout",
    activeShop: true
  });
