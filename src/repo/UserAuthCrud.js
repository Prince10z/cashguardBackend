const userAuthModel = require("../models/UserAuthModel.js");

//Check the email exist or not.....
async function UserEmailExistOrNot(userEmail) {
  const findUserByEmail = await userAuthModel.findOne({
    userEmail: userEmail,
  });
  if (findUserByEmail) {
    return true;
  } else {
    return false;
  }
}
async function UserEmailAndPassExistOrNor(userEmail, pass) {
  try {
    const userEmailPassExist = await userAuthModel.findOne({ userEmail, pass });
    if (userEmailPassExist) {
      return userEmailPassExist;
    } else {
      return null;
    }
  } catch (err) {
    throw new Error(err);
  }
}

//Create the new user.....
async function createUser(userEmail, userName, pass) {
  const userEmailExist = await UserEmailExistOrNot(userEmail);
  if (userEmailExist == true) {
    return false;
  } else {
    try {
      const newUser = await userAuthModel.create({
        userName,
        userEmail,
        pass,
      });
      if (newUser) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      new Error.throw(e);
    }
  }
}

// Use to add the token in the database.....
async function addTokenToUser(userEmail, newToken) {
  try {
    // Find the user by email and add a new token to the tokens array
    const updatedUser = await userAuthModel.findOneAndUpdate(
      { userEmail }, // Find the user by email
      { $push: { tokens: { token: newToken } } }, // Push the new token to the tokens array
      { new: true } // Return the updated document
    );

    if (updatedUser) {
      console.log("Token added successfully:", updatedUser);
      return { status: "success" };
    } else {
      console.log("User not found");
      return { status: "failed" };
    }
  } catch (error) {
    console.error("Error adding token:", error);
    throw new Error(`Caught an error: ${error.message}`);
  }
}
async function passEmailOfToken(token) {
  try {
    const user = await userAuthModel.findOne({ "tokens.token": token });
    return user;
  } catch (err) {
    throw new Error(err);
  }
}
module.exports = {
  createUser,
  addTokenToUser,
  UserEmailExistOrNot,
  UserEmailAndPassExistOrNor,
  passEmailOfToken,
};
