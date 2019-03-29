const fs = require("fs");
const path = require("path");

const dateFormat = require("dateformat");
const hbs = require("handlebars");
const puppeteer = require("puppeteer");
// const PDFDocument = require("pdfkit");

const ProductModel = require("../models/product");
const OrderModel = require("../models/orders");

exports.getIndex = async (req, res) => {
  await res.status(200).render("shop/index", {
    docTitle: "Home",
    path: "/"
  });
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find();

    await res.status(200).render("shop/product", {
      docTitle: "Products",
      path: "/products",
      products
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params._id);
    await res.status(200).render("shop/product-detail", {
      product,
      docTitle: "Product By ID page",
      path: "/products"
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    await res.status(200).render("shop/cart", {
      path: "/cart",
      docTitle: "Your Cart",
      cart: user.cart.items,
      totalPrice: user.cart.totalPrice
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.body._id);
    await req.user.addToCart(product);
    await res.status(200).redirect("/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.postItemCartDelete = async (req, res, next) => {
  try {
    await req.user.deleteFromCart(req.body.productId, req.body.subTotal);
    await res.status(200).redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ "user.userId": req.user._id });
    await res.status(200).render("shop/orders", {
      docTitle: "Your Orders",
      path: "/orders",
      orders,
      date: dateFormat(orders.date, "dddd, mmmm dS, yyyy")
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.postAddOrder = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const order = await new OrderModel({
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
    await order.save();
    await req.user.clearCart();
    await res.status(200).redirect("/orders");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId);

  hbs.registerHelper("multiply", (val1, val2) => {
    return (val1 * val2).toFixed(2);
  });

  hbs.registerHelper("fixPrice", val1 => {
    return val1.toFixed(2);
  });

  hbs.registerHelper("formatDate", date => {
    return dateFormat(date, "dddd, mmmm dS, yyyy");
  });

  const filePath = await path.join(
    process.cwd(),
    "template",
    "pdfTemplate.hbs"
  );
  const source = await fs.readFileSync(filePath, "utf-8");
  const template = hbs.compile(source);
  const result = template(order);
  const pdfPathName = `data/invoices/${order._id}.pdf`;

  console.log(pdfPathName);

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(result);
    await page.emulateMedia("print");
    await page.pdf({
      path: pdfPathName,
      format: "A4",
      printBackground: true,
      isLandscape: true
    });
    await browser.close();

    const file = fs.createReadStream(pdfPathName);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${pdfPathName}"`);
    file.pipe(res);
  } catch (err) {
    throw new Error(err);
  }
};
