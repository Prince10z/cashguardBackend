const mongoose = require("mongoose");

const userBugetSchema = new mongoose.Schema({
  BudgetID: {
    type: String,
    required: true,
    unique: true,
  },
  userEmail: {
    type: String,
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
  item: {
    type: String,
    required: true, // This field is mandatory
  },
  date: {
    type: Date,
    required: true,
    default: Date.now, // Defaults to the current date if not provided
  },
  time: {
    type: String,
    required: true, // Time in the format of your choice (e.g., "HH:mm:ss")
  },
  amount: {
    type: Number,
    required: true, // Amount spent is mandatory
  },
});
const UserBudgetModel = mongoose.model("UserBudget", userBugetSchema);

module.exports = UserBudgetModel;
