const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const { get404 } = require("./controllers/error");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(cors());

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(get404);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
