require("dotenv").config();

const path = require("path");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const morgan = require("morgan");
const conFlash = require("connect-flash");
const csrf = require("csurf");
const mW = require("./middleware/mW");
// const UserModel = require("./models/user");
const uuidv4 = require("uuid/v4");

const PORT = process.env.PORT;

const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useNewUrlParser", true);

const MongoDBStore = require("connect-mongodb-session")(session);

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

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");
app.set("view options", {
  rmWhitespace: true
});

//Add Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({
    storage: fileStorage,
    fileFilter
  }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(morgan("dev"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use(csrf());
app.use(conFlash());

app.use(mW.isSession); //set lOCAL crsf Token & user NaME

app.use(mW.setLocals); //get User from session

//routes;
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorsController.get500);

app.use(errorsController.get404);

//express error handlers -> will look for all error thrown

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.log(`A Multer error occurred when uploading -> ${error}`);
  }
  console.log(error);
  req.error = error;
  res.redirect("/500");
});

// connection
mongoose
  .connect(process.env.DB_CONN)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
