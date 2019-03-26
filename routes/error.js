const express = require("express");
const router = express.Router();

const errorsController = require("../controllers/error");

router.get("/500", errorsController.get500);

module.exports = router;
