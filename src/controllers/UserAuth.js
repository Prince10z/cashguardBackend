const {
  verificationMail,
} = require("../middleware/EmailValidation/authmiddlewares.js");
const { generateOtp } = require("../middleware/GenerateOtp/EmailOtp.js");
const {
  createUser,
  addTokenToUser,
  UserEmailExistOrNot,
  UserEmailAndPassExistOrNor,
} = require("../repo/UserAuthCrud.js"); // Assuming 'createUser' is in 'userModel.js'
const {
  generateToken,
} = require("../middleware/TokenOperations/generateToken.js");

async function Adduser(req, res) {
  const { userEmail, userName, pass } = req.body;
  const UserEmailAlreadyExist = await UserEmailExistOrNot(userEmail);
  if (UserEmailAlreadyExist === true) {
    return res.status(405).json({ status: "User already exists" });
  }
  // Generate OTP and store it in a session variable (or database)
  const emailOtp = generateOtp();
  req.session.emailOtpData = { otp: emailOtp, email: userEmail }; // Example using session storage
  console.log(emailOtp);
  try {
    await verificationMail(userEmail, userName, emailOtp);
    return res.status(200).json({ status: "OTP sent successfully" });
  } catch (e) {
    return res.status(500).json({ status: "Error in sending OTP" });
  }
}

async function signUpValidation(req, res) {
  const { userEmail, userName, pass, otp } = req.body;

  // Retrieve stored OTP from session (or database)
  const storedOtpData = req.session.emailOtpData; // Example using session storage

  if (!userEmail || !userName || !pass || !otp) {
    return res
      .status(405)
      .json({ status: "Please provide all required details" });
  }
  if (
    storedOtpData &&
    otp === storedOtpData.otp &&
    userEmail === storedOtpData.email
  ) {
    try {
      const user = { userEmail, userName, pass };

      // Wait for the token generation
      const Token = await generateToken(user);

      if (Token.status === "success") {
        // Check if the user can be created
        const createAccount = await createUser(userEmail, userName, pass);
        if (createAccount) {
          // Add the generated token to the user in the database
          const tokenStore = await addTokenToUser(userEmail, Token.token);
          await res.cookie("auth_token", Token.token, {
            httpOnly: true, // Ensures the cookie is only accessible by the server (not by JS code)
            secure: true, // Ensures the cookie is sent over HTTPS
            sameSite: "strict", // Helps prevent CSRF attacks
          });
          if (tokenStore.status === "success") {
            return res
              .status(201)
              .json({ status: "Successfully Signed Up", token: Token.token });
          } else {
            return res
              .status(500)
              .json({ status: "Error", msg: "Error adding token" });
          }
        } else {
          return res.status(405).json({ status: "User already exists" });
        }
      } else {
        return res.status(500).json({ status: "Error", msg: "Server error" });
      }
    } catch (e) {
      return res.status(500).json({ status: "Error", msg: e.toString() });
    }
  } else {
    return res.status(401).json({ status: "Wrong OTP" });
  }
}
async function login(req, res) {
  const { userEmail, pass } = req.body;
  if (!userEmail || !pass) {
    return res.status(400).json({ status: "Error", msg: "Incorrect request" });
  }
  try {
    const user = await UserEmailAndPassExistOrNor(userEmail, pass);
    if (user != null) {
      const userDetails = {
        userName: user.userName,
        userEmail: userEmail,
        pass: pass,
      };
      const Token = await generateToken(userDetails);
      const tokenStore = await addTokenToUser(userEmail, Token.token);
      if (tokenStore.status === "success") {
        await res.cookie("auth_token", Token.token, {
          httpOnly: true, // Ensures the cookie is only accessible by the server (not by JS code)
          secure: true, // Ensures the cookie is sent over HTTPS
          sameSite: "strict", // Helps prevent CSRF attacks
        });
        return res
          .status(200)
          .json({ status: "Successfully Signed Up", token: Token.token });
      } else {
        return res
          .status(500)
          .json({ status: "Error", msg: "Error adding token" });
      }
    } else {
      return res.status(400).json({ status: "Error", msg: "No user exist" });
    }
  } catch (err) {
    return res.status(500).json({ status: "Error", msg: err.toString() });
  }
}

module.exports = { Adduser, signUpValidation, login };
