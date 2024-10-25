const UserBudgetModel = require("../models/UserBugetModel.js");
const {
  generateUniqueIds,
} = require("../middleware/QrCodeOperations/qrCodeGenerationAndScanning.js");

async function getSpends(req, res) {
  const { userEmail } = req.body;
}
//Create Spend
async function createSpend(req, res) {
  const { userEmail, item, date, time, amount } = req.body;
  if (!userEmail || !item || !date || !time || !amount) {
    return res.status(400).json({
      status: "Bad request",
      msg: "UserEmail, item, date , time and amount are required fields.",
    });
  }
  const BudgetID = generateUniqueIds;
  try {
    await UserBudgetModel.create({
      BudgetID,
      userEmail,
      item,
      date,
      time,
      amount,
    });
    return res.status(201).json({
      status: "Success",
      msg: "New Budget is created",
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      msg: `Server error while creating the record.`,
    });
  }
}

//Update Spend
async function updateSpend(req, res) {
  const { userEmail, BudgetID, item, date, time, amount } = req.body;
  if (!userEmail || !BudgetID) {
    return res.status(400).json({
      status: "Bad request",
      msg: "Date and time are required fields.",
    });
  }
  let updateFields = {};
  if (item) updateFields.item = item;
  if (changeddate) updateFields.date = date; // Updating with changeddate
  if (changedtime) updateFields.time = time; // Updating with changedtime
  if (amount) updateFields.amount = amount;
  try {
    let user = await UserBudgetModel.findOneAndUpdate(
      { userEmail, BudgetID }, // Find by current date and time
      { $set: updateFields }, // Set the fields to update
      { new: true } // Return the updated document
    );
    if (!user) {
      return res.status(404).json({
        status: "Not found",
        msg: "No entry found for the given date and time.",
      });
    }
    return res.status(200).json({
      status: "Success",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      msg: "Server error while updating the record.",
    });
  }
}

// delete Spend
async function removeSpend(req, res) {
  const { userEmail, BudgetID } = req.body;
  if (!userEmail || !BudgetID) {
    return res.status(400).json({
      status: "Bad request",
      msg: "Date and time are required fields.",
    });
  }
  try {
    let removedSpend = await UserBudgetModel.findOneAndDelete({
      userEmail,
      BudgetID,
    });

    // If no entry is found, return a 404 error
    if (!removedSpend) {
      return res.status(404).json({
        status: "Not found",
        msg: "No entry found for the given date and time.",
      });
    }

    // If deletion is successful, respond with success status
    return res.status(200).json({
      status: "Success",
      msg: "Record deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      status: "Error",
      msg: "Server error while trying to delete the record.",
    });
  }
}

module.exports = { createSpend, updateSpend, removeSpend };
