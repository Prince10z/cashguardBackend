const express = require("express");
const authRoutes = express.Router();
const {
  createSpend,
  updateSpend,
  removeSpend,
} = require("../controllers/UserBugetOperations.js");
authRoutes.post("/signUp", Adduser);
authRoutes.post("/signUpValidation", signUpValidation);
authRoutes.post("/login", login);
module.exports = authRoutes;
