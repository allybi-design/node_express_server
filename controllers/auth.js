require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const sgMail = require("@sendgrid/mail");

const UserModel = require("../models/user");

const { validationResult } = require("express-validator/check");

sgMail.setApiKey(process.env.SG_KEY);

//GET -  useer Log In
exports.getLogIn = (req, res, next) => {
  res.status(200).render("auth/login", {
    docTitle: "User Log In",
    path: "/auth/log-in",
    errors: [],
    values: {
      email: null,
      pw: null
    }
  });
};

//POST  - user Log In
exports.postLogIn = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    // check for any Errors
    if (!errors.isEmpty()) {
      // if there ARE Errors
      return res.status(422).render("auth/login", {
        docTitle: "User log-in",
        path: "/auth/log-in",
        errors: errors.array(),
        values: {
          email: req.body.email,
          pw: req.body.pw
        }
      });
    }

    // No Errors
    // check there is user with that email
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      // if YES user
      bcrypt
        .compare(req.body.pw, user.password)
        .then(passwordMatch => {
          //& passwords NOT match 👎
          if (!passwordMatch) {
            req.flash("error", "SORRY - INVALID PASSWORD");
            return res.redirect("auth/log-in");
          } else {
            //& passwords DO match 👍
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
              return res.redirect("/products");
            });
          }
        })
        .catch(err => {
          return res.redirect("auth/log-in");
        });
    } else {
      res.redirect("/auth/log-in");
    }
  } catch (err) {
    // if NO user ->try again👎
    const error = new Error();
    error.httpStatusCode = 500;
    error.msg = "an Error message";
    return next(error);
  }
};

//GET - user Log Out
exports.getLogOut = (req, res, next) => {
  req.session.destroy(err => {
    res.status(200).redirect("/");
  });
};

//GET  - user Register
exports.getRegister = (req, res, next) => {
  res.status(200).render("auth/register", {
    docTitle: "Register User",
    path: "/auth/register",
    errors: [],
    values: {
      name: null,
      email: null,
      pw: null,
      confirmPw: null
    }
  });
};

//POST - user Register
exports.postRegister = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register", {
      docTitle: "Register User",
      path: "/auth/register",
      errors: errors.array(),
      values: {
        name: req.body.name,
        email: req.body.email,
        pw: req.body.pw,
        confirmPw: req.body.confirmPw
      }
    });
  }
  try {
    const user = await new UserModel({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.pw, salt)
      // password:req.body.pw
    });
    await user.save();
    await sgMail.send({
      to: req.body.email,
      from: "admin@node-server-shop.com",
      subject: "Confirmation of Sign up!",
      html: `<h1>Congtrratulations</h1>                                              
      <h3>Welcome ${
        req.body.name
      },\n onboard to NodeServerShop.com</h3>\n           
      <h3>You are now signed up! - with your Email: ${
        req.body.email
      }</h3>\n         
      <p>Thanks NSS</p>`
    });
    res.redirect("/auth/log-in");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg = "an Error message";
    return next(error);
  }
};

// GET RESET
exports.getReset = (req, res, next) => {
  res.status(200).render("auth/reset", {
    docTitle: "Reset Password",
    path: "/auth/reset",
    errorMsg: req.flash("error")
  });
};

//POST Rest
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/auth/reste");
    }
    const token = buffer.toString("hex");
    UserModel.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash("error", "NO account with that email");
          return res.redirect("/auth/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; // 1hr
        return user.save();
      })
      .then(() => {
        res.redirect("/");
        return sgMail.send({
          to: req.body.email,
          from: "admin@node-server-shop.com",
          subject: "Reset password!",
          html: `<h1>Please reset you password here:</h1>
                <a href="http://localhost:3000/auth/password-reset/${token}">
                  <p>Click on this link to reset you password</p>
                </a>\n
                <p>Thanks NSS</p>
              `
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        error.msg = "an Error message";
        return next(error);
      });
  });
};

exports.getPasswordReset = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      resetToken: req.params.token,
      resetTokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      req.flash("error", "NOT FOUND");
      return res.redirect("/");
    }
    res.status(200).render("auth/password-reset", {
      docTitle: "Reset Password",
      path: "/auth/reset",
      errors: [],
      userId: user._id.toString(),
      token: req.params.token
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg = "an Error message";
    return next(error);
  }
};

exports.postPasswordReset = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      _id: req.body._id,
      resetToken: req.body.token,
      resetTokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
      req.flash("error", "NOT FOUND");
      return res.redirect("/");
    }
    user.password = bcrypt.hashSync(req.body.pw, salt);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.redirect("/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    error.msg = "an Error message";
    return next(error);
  }
};
