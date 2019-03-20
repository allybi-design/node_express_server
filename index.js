require("dotenv").config();

const path = require("path");

const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const User = require("./models/user")

const { get404 } = require("./controllers/error"); //error controller
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT;

//Add Middleware
app.use(morgan("dev"));
app.use(cors());

//set handbar viewEngine
app.set("view engine", "ejs");
app.set("views", "views");

//set body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// routes;
app.use((req, res, next) => {
  User.findById("5c90bbda514778313c83d3d8")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(get404);

// connection
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PW}${
      process.env.DB_CLUSTER
    }/nodeServerShop?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    User.findOne()
      .then(user => {
        if (!user) {
          const user = new User({
            name: "Alison",
            email: "me@here.com",
            cart: {
              items: [],
              totalPrice: 0
            }
          });
          user
            .save()
            .then(error => {
              console.log("Connected to Mongo DB");
            })
            .catch(err => {
              console.log(err);
            });
        }
      })
      .catch(err => console.log(err));

    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  });
