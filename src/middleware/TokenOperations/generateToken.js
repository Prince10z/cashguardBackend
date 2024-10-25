const jwt = require("jsonwebtoken");
function generateToken(user) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { user },
      process.env.SECRET_KEY,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) {
          reject({ status: "error", msg: err.message });
        } else {
          resolve({ status: "success", token: token });
        }
      }
    );
  });
}
function verifyToken(req, res, next) {
  const token = req.headers["authorization"] || req.cookies.auth_token;
  if (!token) {
    return res.status(403).send({ message: "No token provided." });
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized! Invalid token." });
    }
    req.userId = decoded.id;
    next(); // Call the next middleware or route handler
  });
}
module.exports = { generateToken, verifyToken };
