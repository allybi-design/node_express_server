require("dotenv").config();

const path = require("path");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const morgan = require("morgan");
const conFlash = require("connect-flash");
const csrf = require("csurf");
const mW = require("./middleware/mW");
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
const shopController = require("./controllers/shop");

const app = express();

// const store = new MongoDBStore({
//   uri: process.env.DB_CONN,
//   collection: "sessions"
// });

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

//Add Middleware
app.use(bodyParser.json()); //.urlencoded({ extended: false })) <- in master branch

// app.use(cors())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET POST PUT PATCH DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(
  multer({
    storage: fileStorage,
    fileFilter
  }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(morgan("dev"));



//check isAuth
// app.use(mW.setIsAuth);

// check session
// app.use(mW.isSession);

// app.post("/addorder", mW.isAuth, shopController.postAddOrder); //NB MUST CATCH BEFOR CSRF TRAP

//set CSRF TOKEN
// app.use(csrf());
// app.use(mW.setCsrfToken);

//routes;
// app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// app.get("/500", errorsController.get500);

// app.use(errorsController.get404);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const error = new Error(err)
    error.msg `A Multer error occurred when uploading`
    res.status(500).send({error});
  }
  next()
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
