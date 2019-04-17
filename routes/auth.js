const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const mW = require("../middleware/mW");


router.post("/auth/log-in", authController.postLogIn);

router.post("/auth/log-out", authController.postLogOut);

router.post("/auth/register", authController.postRegister);


// router.post("/auth/reset", authController.postReset);

// router.get("/auth/password-reset/:token", authController.getPasswordReset);
// router.post("/auth/password-reset", authController.postPasswordReset);

module.exports = router;
