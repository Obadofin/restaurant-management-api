const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const {
  registerValidation,
} = require("../validations/userValidator");


router.post("/register", validate(registerValidation), controller.register);
router.post("/login", controller.login);

module.exports = router;