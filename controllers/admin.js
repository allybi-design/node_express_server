const ProductModel = require("../models/product");
const { validationResult } = require("express-validator/check");

exports.getAddProduct = async (req, res, next) => {
  try {
    await res.status(200).render("admin/edit-product", {
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
  } catch (err) {
    const error = new Error();
    error.httpStatusCode = 500;
    error.msg = "an Error message";
    return next(error);
  }
};

//POST- Add Product
exports.postAddProduct = (req, res, next) => {
  // check for any Errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // if there ARE Errors
    return res.status(422).render("admin/edit-product", {
      docTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errors: errors.array(),
      value: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        userId: req.user._id // could remove ._id
      }
    });
  }

  const product = new ProductModel({
    title: req.body.title,
    imageUrl: req.file.path.replace("\\", "/"),
    price: req.body.price,
    description: req.body.description,
    userId: req.user._id // could remove ._id
  });
  product
    .save()
    .then(() => {
      res.redirect("/products");
    })
    .catch(err => {
      const error = new Error();
      error.httpStatusCode = 500;
      error.msg = `ERROR - ${err}`;
      return next(error);
    });
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find({ userId: req.user._id });
    res.status(200).render("admin/products", {
      docTitle: "Product",
      path: "/admin/product",
      products
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg = `ERROR - ${err}`;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const editMode = req.query.edit;
    if (!editMode) {
      return res.status(200).redirect("/");
    }
    const product = await ProductModel.findById(req.params._id);

    res.status(200).render("admin/edit-product", {
      docTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      errors: [],
      product
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg = `ERROR - ${err}`;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    // check for any Errors
    if (!errors.isEmpty()) {
      // if there ARE Errors
      return res.status(422).render("admin/edit-product", {
        docTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        errors: errors.array(),
        product: {
          _id: req.body._id,
          title: req.body.title,
          price: req.body.price,
          description: req.body.description,
          userId: req.user._id // could remove ._id
        }
      });
    }
    await ProductModel.findOneAndUpdate(
      { _id: req.body._id },
      {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
        //NB NO NEED TO INC USERID AS THIS CAN'T CHANGE IF UPDATED
      }
    );
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg = `ERROR - ${err}`;
    return next(error);
  }
};

exports.deleteProduct = (req, res, next) => {
  ProductModel.findOneAndDelete({_id:req.params.productId})
    .then(result => {
      res.status(200).json({ msg: "Product Deleted" });
    })
    .catch(err => {
      res.status(500).json({ msg: "OOppss... something went wrong" });
    });
};
