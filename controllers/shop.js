require("dotenv").config();

const fs = require("fs");
const path = require("path");

const dateFormat = require("dateformat");
const hbs = require("handlebars");
const puppeteer = require("puppeteer");
const maxPerPage = 4;

const ProductModel = require("../models/product");
const OrderModel = require("../models/orders");
const UserModel = require("../models/user");

const stripe = require("stripe")(process.env.STRIP_KEY);

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  console.log(page);
  try {
    const docCount = await ProductModel.countDocuments();
    const totalPages = Math.ceil(docCount / maxPerPage);
    const products = await ProductModel.find()
      .skip((page - 1) * maxPerPage)
      .limit(maxPerPage);
    res.status(200).send({
      products,
      totalPages,
      maxPerPage
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    res.status(200).send({ product });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    res.status(err.httpStatusCode).send({ msg: "No Product found" });
  }
};

exports.postAddItemToCart = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.body.product._id);
    if (!product) {
      return res.status(400).send({ msg: "Product Not found" });
    }
    const user = await UserModel.findById(req.body.userId);
    if (!user) {
      return res.status(400).send({ msg: "No User found" });
    }
    const cart = await user.addItem(product);
    return res.status(200).send({ cart });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.postDeleteItemInCart = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.body.userId);
    if (!user) {
      return res.status(400).send({ msg: "No User found" });
    }
    const cart = await user.deleteItem(req.body.productId, req.body.subTotal);
    // console.log(`items still in cart ${cart}`);
    res.status(200).send({ cart });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.postIncItemQty = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.body.userId);
    if (!user) {
      return res.status(400).send({ msg: "No User found" });
    }
    const cart = await user.incItemQty(req.body.productId, req.body.price);
    res.status(200).send({ cart });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.postDecItemQty = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.body.userId);
    if (!user) {
      return res.status(400).send({ msg: "No User found" });
    }
    const cart = await user.decItemQty(req.body.productId, req.body.price);
    res.status(200).send({ cart });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

// exports.getCheckOut = async (req, res, next) => {
//   try {
//     const user = await req.user.populate("cart.items.productId").execPopulate();
//     await res.status(200).render("shop/checkout", {
//       path: "/cart",
//       docTitle: "Cart",
//       cart: user.cart.items,
//       user: user,
//       date: dateFormat(Date.now(), "dddd, mmmm dS, yyyy"),
//       totalPrice: user.cart.totalPrice
//     });
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     error.msg;
//     return next(error);
//   }
// };

// exports.postAddOrder = async (req, res, next) => {
//   try {
//     const user = await req.user.populate("cart.items.productId").execPopulate();
//     const order = await new OrderModel({
//       user: {
//         name: req.user.name,
//         userId: req.user
//       },
//       products: user.cart.items.map(item => {
//         return {
//           quantity: item.quantity,
//           product: { ...item.productId._doc }
//         };
//       }),
//       totalPrice: user.cart.totalPrice
//     });
//     const result = await order.save();
//     console.log(req.user);
//     console.log(result._id);
//     const charge = stripe.charges.create({
//       amount: req.user.cart.totalPrice * 100,
//       currency: "gbp",
//       description: `orderID: ${result._id.toString()}`,
//       source: req.body.stripeToken,
//       metadata: { orderID: result._id.toString() }
//     });

//     req.user.clearCart();

//     res.status(200).redirect("/orders");
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     error.msg;
//     return next(error);
//   }
// };

// exports.getOrders = async (req, res, next) => {
//   try {
//     const orders = await OrderModel.find({ "user.userId": req.user._id });
//     await res.status(200).render("shop/orders", {
//       docTitle: "Your Orders",
//       path: "/orders",
//       orders,
//       date: dateFormat(orders.date, "dddd, mmmm dS, yyyy")
//     });
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     error.msg;
//     return next(error);
//   }
// };

// exports.getInvoice = async (req, res, next) => {
//   const order = await OrderModel.findById(req.params.orderId);

//   hbs.registerHelper("multiply", (val1, val2) => {
//     return (val1 * val2).toFixed(2);
//   });

//   hbs.registerHelper("fixPrice", val1 => {
//     return val1.toFixed(2);
//   });

//   hbs.registerHelper("formatDate", date => {
//     return dateFormat(date, "dddd, mmmm dS, yyyy");
//   });

//   const filePath = await path.join(
//     process.cwd(),
//     "template",
//     "pdfTemplate.hbs"
//   );
//   const source = await fs.readFileSync(filePath, "utf-8");
//   const template = hbs.compile(source);
//   const result = template(order);
//   const pdfPathName = `data/invoices/${order._id}.pdf`;

//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setContent(result);
//     await page.emulateMedia("print");
//     await page.pdf({
//       path: pdfPathName,
//       format: "A4",
//       printBackground: true,
//       isLandscape: true
//     });
//     await browser.close();

//     const file = fs.createReadStream(pdfPathName);
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `inline; filename="${pdfPathName}"`);
//     file.pipe(res);
//   } catch (err) {
//     throw new Error(err);
//   }
// };
