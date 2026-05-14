// This file defines the routes for user authentication (register and login)
const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const {
  registerValidation,
} = require("../validations/userValidator");


// Sign-up route: checks the user's info is valid first, then creates their account
router.post("/register", validate(registerValidation), controller.register);

// Sign-in route: checks email and password and gives them an access token
router.post("/login", controller.login);

module.exports = router;