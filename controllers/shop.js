const ProductModel = require("../models/product");
const OrderModel = require("../models/orders");
const dateFormat = require("dateformat");

exports.getIndex = (req, res) => {
  res.status(200).render("shop/index", {
    docTitle: "Home",
    path: "/"
  });
};

exports.getProducts = (req, res) => {
  ProductModel.find()
    .then(products => {
      res.status(200).render("shop/product", {
        docTitle: "Products",
        path: "/products",
        products
      });
    })
    .catch(err => console.log(err));
};

exports.getProductById = (req, res, next) => {
  ProductModel.findById(req.params._id)
    .then(product => {
      res.status(200).render("shop/product-detail", {
        product,
        docTitle: "Product By ID page",
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      res.status(200).render("shop/cart", {
        path: "/cart",
        docTitle: "Your Cart",
        cart: user.cart.items,
        totalPrice: user.cart.totalPrice
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  ProductModel.findById(req.body._id)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.status(200).redirect("/products");
    })
    .catch(err => console.log(err));
};

exports.postItemCartDelete = (req, res, next) => {
  req.user
    .deleteFromCart(req.body.productId, req.body.subTotal)
    .then(() => {
      res.status(200).redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  OrderModel.find({ "user.userId": req.user._id })
    .then(orders => {
      res.status(200).render("shop/orders", {
        docTitle: "Your Orders",
        path: "/orders",
        orders,
        date: dateFormat(orders.date, "dddd, mmmm dS, yyyy")
      });
    })
    .catch(err => console.log(err));
};

exports.postAddOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const order = new OrderModel({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: user.cart.items.map(item => {
          return {
            quantity: item.quantity,
            product: { ...item.productId._doc }
          };
        }),
        totalPrice: user.cart.totalPrice
      });
      return order.save();
    })
    .then(() => {
      req.user.clearCart();
    })
    .then(() => {
      res.status(200).redirect("/orders");
    })
    .catch(err => console.log(err));
};
