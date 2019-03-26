require("dotenv").config();

const path = require("path");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const conFlash = require("connect-flash");
const csrf = require("csurf");
const mW = require("./middleware/mW");

const PORT = process.env.PORT;
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const MongoDBStore = require("connect-mongodb-session")(session);

const UserModel = require("./models/user");
//routes
const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const errorsController = require("./controllers/error");

const app = express();
const store = new MongoDBStore({
  uri: process.env.DB_CONN,
  collection: "sessions"
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");
app.set("view options", {
  rmWhitespace: true
});

//Add Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(csrfProtection);
app.use(conFlash());

app.use(mW.isSession);

app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  console.log(`CSRF Token is ${res.locals.csrfToken}`);
  next();
});

//routes;
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorsController.get500);

app.use(errorsController.get404);

//express error handlers -> will look for all error thrown
app.use((error, req, res, next) => {
  res.redirect("/500")
})

// connection
mongoose
  .connect(process.env.DB_CONN, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
