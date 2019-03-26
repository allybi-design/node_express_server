const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const mW = require("../middleware/mW");

router.get("/auth/log-in", authController.getLogIn);
router.post("/auth/log-in", mW.validateLogin, authController.postLogIn);

router.get("/auth/log-out", mW.isAuth, authController.getLogOut);

router.get("/auth/register", authController.getRegister);
router.post("/auth/register", mW.validateRegister, authController.postRegister);

router.get("/auth/reset", authController.getReset);
router.post("/auth/reset", authController.postReset);

router.get("/auth/password-reset/:token", authController.getPasswordReset);
router.post("/auth/password-reset", authController.postPasswordReset);

module.exports = router;
