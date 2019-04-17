require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const sgMail = require("@sendgrid/mail");

const UserModel = require("../models/user");

const { validationResult } = require("express-validator/check");

sgMail.setApiKey(process.env.SG_KEY);

//POST  - user Log In
exports.postLogIn = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send({ msg: "NO User found" });
  }
  // if YES user
  const matched = bcrypt.compare(req.body.password, user.password);
  if (!matched) {
    //& passwords NOT match 👎
    // console.log(`userpassword: ${user.password}`);
    // console.log(`bodyPasssword: ${req.body.password}`);
    return res.status(500).send({ msg: "Password Error" });
  } else {
    //& passwords DO match 👍
    user.isLoggedIn = true;
    user.save();
    return res.status(200).send({
      user: {
        id: user._id,
        name: user.name,
        isAuth: user.isLoggedIn,
      },
      cart: user.cart
    });
  }
};

//GET - user Log Out
exports.postLogOut = async (req, res, next) => {
  const user = await UserModel.findOne({ _id: req.body.id });
  if (user) {
    user.isLoggedIn = false;
    user.save();
    return res.status(200).send({
      user: {
        id: "",
        name: "",
        isAuth: user.isLoggedIn,
        isAdmin: false
      }
    });
  } else {
    res.status(400).send({ msg: "No User to log out" });
  }
};

//POST - user Register
exports.postRegister = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(422).send({
  //     errors: errors.array()
  //   });
  // }
  try {
    const user = await new UserModel({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
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
    res.status(200).send({ msg: "user registered pklease log in" });
  } catch (err) {
    // if NO user ->try again👎
    const error = new Error();
    error.httpStatusCode = 500;
    error.msg = "There was a problem ";
    return res.status(400).send(error);
  }
};

// //POST Rest
// exports.postReset = async (req, res, next) => {
//   try {
//     crypto.randomBytes(32, (err, buffer) => {
//       if (err) {
//         const error = new Error();
//         error.httpStatusCode = 400;
//         error.msg = "There was a problem getting crypto token";
//         return res.status(400).send(error);
//       }
//       const token = buffer.toString("hex");

//       async () => {
//         const user = await UserModel.findOne({ email: req.body.email });
//         if (!user) {
//           const error = new Error();
//           error.httpStatusCode = 400;
//           err.msg = "NO account with that email to reset password";
//           return res.status(400).send(error);
//         }
//         // user.resetToken = token;
//         // user.resetTokenExpiration = Date.now() + 60 * 60 * 1000; // 1hr
//         await user.save();
//       };
//       sgMail.send({
//         to: req.body.email,
//         from: "admin@node-server-shop.com",
//         subject: "Reset password!",
//         html: `<h1>Please reset you password here:</h1>
//                 <a href="http://localhost:3000/auth/password-reset/${token}">
//                   <p>Click on this link to reset you password</p>
//                 </a>\n
//                 <p>Thanks NSS</p>
//               `
//       });
//     });
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     error.msg = "an Error message";
//     return next(error);
//   }
// };

// exports.getPasswordReset = async (req, res, next) => {
//   try {
//     const user = await UserModel.findOne({
//       resetToken: req.params.token,
//       resetTokenExpiration: { $gt: Date.now() }
//     });
//     if (!user) {
//       req.flash("error", "NOT FOUND");
//       return res.redirect("/");
//     }
//     res.status(200).render("auth/password-reset", {
//       docTitle: "Reset Password",
//       path: "/auth/reset",
//       errors: [],
//       userId: user._id.toString(),
//       token: req.params.token
//     });
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     error.msg = "an Error message";
//     return next(error);
//   }
// };

// exports.postPasswordReset = async (req, res, next) => {
//   try {
//     const user = await UserModel.findOne({
//       _id: req.body._id,
//       resetToken: req.body.token,
//       resetTokenExpiration: { $gt: Date.now() }
//     });
//     if (!user) {
//       req.flash("error", "NOT FOUND");
//       return res.redirect("/");
//     }
//     user.password = bcrypt.hashSync(req.body.pw, salt);
//     user.resetToken = undefined;
//     user.resetTokenExpiration = undefined;
//     await user.save();
//     return res.redirect("/products");
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     error.msg = "an Error message";
//     return next(error);
//   }
// };
