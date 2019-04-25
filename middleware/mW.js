const UserModel = require("../models/user");
const { body } = require("express-validator/check");

exports.validateProduct = [
  body("title", "Title is to Short")
    .trim()
    .isString()
    .isLength({ min: 5, max: 40 }),
  body("price", "Price need to be Currency figure").isCurrency(),
  body("description", "Description length Error")
    .trim()
    .isLength({ min: 10, max: 1000 }),
  (req, res, next) => {
    next();
  }
];

exports.validateLogin = [
  body("email", "Try again - Email Address is Invalid")
    .isEmail()
    .normalizeEmail()
    .trim(),
  body("pw", "Password must be between 5 - 10 Charators")
    .isLength({ min: 5, max: 10 })
    .trim()
    .isAlphanumeric(),
  (req, res, next) => {
    next();
  }
];

exports.validateRegister = [
  body("email", "Try again - Email Address is Invalid")
    .isEmail()
    .normalizeEmail()
    .trim()
    .custom((value, { req }) => {
      return UserModel.findOne({ email: value }).then(userMatched => {
        if (userMatched) {
          return Promise.reject("Email exists");
        }
      });
    }),
  body("password", "Password must exist")
    .trim()
    .isAlphanumeric(),
  (req, res, next) => {
    next();
  }
];

// exports.isAuth = (req, res, next) => {
//   if (!req.session.isLoggedIn) {
//     return res.status(400).send({msg:"Not logged-in"}); //<- redirect if False
//   }
//   next();
// };

// exports.isSession = (req, res, next) => {
//   if (!req.session.user) {
//     return next(); //<- if NOT sesssion.user NEXT
//   }
//   UserModel.findById(req.session.user._id)
//     .then(user => {
//       if (!user) {
//         return next();
//       }
//       req.user = user;
//       res.locals.userName = user.name;
//       next();
//     })
//     .catch(err => {
//       console.log("Failed Session Validation");
//       next(new Error(err));
//     });
// };

// exports.setIsAuth = (req, res, next) => {
//   res.locals.isAuth = req.session.isLoggedIn;
//   next();
// };

// exports.setCsrfToken = (req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// };
