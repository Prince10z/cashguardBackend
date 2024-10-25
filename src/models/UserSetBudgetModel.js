const mongoose = require("mongoose");

const userSetBugetSchema = new mongoose.Schema({
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
  Fromdate: {
    type: Date,
    required: true,
    default: Date.now, // Defaults to the current date if not provided
  },
  Todate: {
    type: Date,
    required: true,
    default: function () {
      const today = new Date();
      today.setDate(today.getDate() + 1); // Set to the next day
      return today;
    },
  },
  amount: {
    type: Number,
    required: true, // Amount spent is mandatory
  },
});
const UserSetBudgetModel = mongoose.model("UserSetBudget", userSetBugetSchema);

module.exports = UserSetBudgetModel;
