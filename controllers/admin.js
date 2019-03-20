const ProductModel = require("../models/product");
const UserModel = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.status(200).render("admin/edit-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

//POST- Add Product
exports.postAddProduct = (req, res, next) => {
  const product = new ProductModel({
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    description: req.body.description,
    userId: req.user._id // could remove ._id
  });
  product
    .save()
    .then(() => {
      res.redirect("/products");
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  ProductModel.find()
    .then(products => {
      res.status(200).render("admin/products", {
        docTitle: "Product",
        path: "/admin/product",
        products
      });
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.status(400).redirect("/");
  }
  ProductModel.findById(req.params._id)
    .then(product => {
      res.status(200).render("admin/edit-product", {
        docTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product
      });
    })
    .catch(err => {
      console.log("Sorry Can not find Product");
      return res.status(400).redirect("/");
    });
};

exports.postEditProduct = (req, res, next) => {
  ProductModel.findByIdAndUpdate(req.body._id, {
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    desacription: req.body.description
  })
    .then(result => {
      console.log("Updated product");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  ProductModel.findByIdAndDelete(req.body._id)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
      res.status(400).redirect("/admin/products");
    });
};
