const ProductModel = require("../models/product");
const { validationResult } = require("express-validator/check");

exports.getAddProduct = (req, res, next) => {
  console.log("im here");
  res.status(200).render("admin/edit-product", {
    docTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errors: [],
    value: {
      title: "",
      imageUrl: "",
      price: 0,
      description: ""
    },
    product: {
      title: "",
      imageUrl: "",
      price: 0,
      description: ""
    }
  });
};

//POST- Add Product
exports.postAddProduct = (req, res, next) => {
 
  const errors = validationResult(req);
  // check for any Errors
  if (!errors.isEmpty()) {
    // if there ARE Errors 
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      docTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errors: errors.array(),
      value: {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        description: req.body.description,
        userId: req.user._id, // could remove ._id
      }
    });
  }
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
      return res.redirect("/products");
    })
    .catch(err => {
      const error = new Error();
      error.httpStatusCode = 500;
      error.msg = "an Error message";
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  ProductModel.find({ userId: req.user._id })
    .then(products => {
      res.status(200).render("admin/products", {
        docTitle: "Product",
        path: "/admin/product",
        products
      });
    })
    // .catch(err => console.log(err));
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      error.msg = "an Error message";
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.status(200).redirect("/");
  }
  ProductModel.findById(req.params._id)
    .then(product => {
      console.log(product);
      res.status(200).render("admin/edit-product", {
        docTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        errors: [],
        product
      });
    })
    // .catch(err => console.log(err));
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      error.msg = "an Error message";
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  // check for any Errors
  if (!errors.isEmpty()) {
    console.log("There are errors");
    // if there ARE Errors
    return res.status(422).render("admin/edit-product", {
      docTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      errors: errors.array(),
      product: {
        _id: req.body._id,
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        description: req.body.description,
        userId: req.user._id // could remove ._id
      }
    });
  }

  ProductModel.findOneAndUpdate({_id: req.body._id}, {
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    description: req.body.description
    //NB NO NEED TO INC USERID AS THIS CAN'T CHANGE IF UPDATED
  })
    .then(() => {
      return res.redirect("/admin/products");
    })
    // .catch(err => console.log(err));
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      error.msg;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  ProductModel.findByIdAndDelete(req.body._id)
    .then(() => {
      res.redirect("/admin/products");
    })
    // .catch(err => console.log(err));
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      error.msg;
      return next(error);
    });
};
