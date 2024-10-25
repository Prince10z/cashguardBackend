const mongoose = require("mongoose");

const userAuthSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: "Invalid email address format",
    },
    trim: true, // Trims leading/trailing spaces
    lowercase: true, // Converts the email to lowercase
  },
  pass: {
    type: String,
    required: true,
    minlength: 6,
    validate: {
      validator: function (value) {
        return value.length >= 6;
      },
      message: "Password must be at least 6 characters long",
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

const userAuthModel = mongoose.model("UserAccounts", userAuthSchema);
module.exports = userAuthModel;
