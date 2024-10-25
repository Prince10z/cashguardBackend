const express = require("express");
const {
  Adduser,
  signUpValidation,
  login,
} = require("../controllers/UserAuth.js");
const authRoutes = express.Router();

authRoutes.post("/signUp", Adduser);
authRoutes.post("/signUpValidation", signUpValidation);
authRoutes.post("/login", login);
module.exports = authRoutes;
