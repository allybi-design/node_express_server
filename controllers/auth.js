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
exports.postLogIn = (req, res, next) => {
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
  UserModel.findOne({ email: req.body.email })
    .then(user => {
      // if YES user
      if (user) {
        bcrypt
          .compare(req.body.pw, user.password)
          .then(passwordMatch => {
            //& passwords NOT match 👎
            if (!passwordMatch) {
              req.flash("error", "SORRY - INVALID PASSWORD");
              return res.redirect("auth/log-in");
            }
            //& passwords DO match 👍
            console.log("passwords DO matched");
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
              return res.redirect("/products");
            });
          })
          .catch(err => {
            return res.redirect("auth/log-in");
          });
      } else {
        res.redirect("/auth/log-in");
      }
    })
    // if NO user ->try again👎
    .catch(err => {
      console.log(err);
      return res.redirect("/auth/log-in");
    });
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
exports.postRegister = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors.array());
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
  const user = new UserModel({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.pw, salt)
  });
  user
    .save()
    .then(() => {
      res.redirect("/auth/log-in");
      return sgMail.send({
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
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      error.msg = "an Error message";
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  res.status(200).render("auth/reset", {
    docTitle: "Reset Password",
    path: "/auth/reset",
    errorMsg: req.flash("error")
  });
};

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

exports.getPasswordReset = (req, res, next) => {
  UserModel.findOne({
    resetToken: req.params.token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        req.flash("error", "NOT FOUND");
        return res.redirect("/");
      }
      res.status(200).render("auth/password-reset", {
        docTitle: "Reset Password",
        path: "/auth/reset",
        userId: user._id.toString(),
        token: req.params.token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      error.msg = "an Error message";
      return next(error);
    });
};

exports.postPasswordReset = (req, res, next) => {
  UserModel.findOne({
    _id: req.body._id,
    resetToken: req.body.token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        req.flash("error", "NOT FOUND");
        return res.redirect("/");
      }
      user.password = bcrypt.hashSync(req.body.pw, salt);
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      user.save();
      res.redirect("/products");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      error.msg = "an Error message";
      return next(error);
    });;
};
