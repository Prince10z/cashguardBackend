const express = require("express");
const app = express();
const http = require("http");
const connectDB = require("./config/connectDb.js");
const authRoutes = require("./routes/userAuthroutes.js");
require("dotenv").config();
const port = process.env.PORT || 3000;
const session = require("express-session");
const { Server } = require("socket.io");
const server = http.createServer(app);
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const {
  generateUniqueQRCode,
} = require("./middleware/QrCodeOperations/qrCodeGenerationAndScanning.js");
const {
  UserEmailExistOrNot,
  passEmailOfToken,
} = require("./repo/UserAuthCrud.js");
app.use(cookieParser());
app.use(express.json()); // Ensure to include JSON parsing
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Adjust as needed
      maxAge: 60 * 1000, // 1 day
    },
  })
);

const jwt = require("jsonwebtoken");
const axios = require("axios");
const io = new Server(server, {
  cors: {
    origin: "*", // Specify allowed origins for CORS
    methods: ["GET", "POST"],
  },
});

//Socket Operations
io.on("connection", (socket) => {
  let qrCode = "";
  var uniqueId = uuidv4();
  console.log("A user connected:", socket.id);
  var intervalId = null;
  // Handle custom events from client

  // Brower generating QR code and Generating uniqeID for pc
  socket.emit("uniqueId", uniqueId);

  //Webpage
  socket.on("ConnectQR", async (msg) => {
    qrCode = await generateUniqueQRCode(uniqueId);
    if (qrCode) {
      socket.emit(uniqueId, qrCode);
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(async () => {
      qrCode = await generateUniqueQRCode(uniqueId);
      if (qrCode) {
        socket.emit(qrCode, qrCode);
        socket.on(`Listen${qrCode}`, async (response) => {
          // Make a POST request to your login API
          const user = await passEmailOfToken(response.token);
          const loginApiUrl = "http://localhost:5959/api/auth/login";
          const { data } = await axios.post(loginApiUrl, {
            userEmail: user.userEmail,
            pass: user.pass,
          });

          console.log("Login API response:", data);

          // Handle the response from your login API here
          if (data.status === "Successfully Signed Up") {
            // Optionally, you can emit success or token information back to the client
            socket.emit("loginSuccess", data.token);
            if (intervalId != null) {
              clearInterval(intervalId);
              intervalId = null; // Reset intervalId
            }
          } else {
            // Handle login failure case
            socket.emit("loginFailure", data.msg);
          }
        });
      }
    }, 10000);

    //mobile socket
    socket.on(qrCode, async (response) => {
      try {
        var authdata = null;
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
          if (err) {
            socket.emit("loginFailure", "Unauthorized! Invalid token.");
          }
          if (decoded) {
            socket.broadcast.emit(`Listen${qrCode}`, { token });
            authdata = decoded;
            console.log(authdata);
          }
        });
      } catch (error) {
        console.error("Error calling login API:", error);
        socket.emit("loginFailure", "An error occurred during login.");
      }

      // Clear the interval when response is received
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null; // Reset intervalId
      }
    });
  });

  //Mobile Scanner
  socket.on("scanQRCode", async (msg) => {
    // Handle QR code scanning logic
    try {
      if (msg.qrCode) {
        const userEmail = msg.userEmail;

        const emailExistOrNot = UserEmailExistOrNot(userEmail);
        if (emailExistOrNot == true) {
          const pass = await passOfEmail(userEmail);
          const userAuthdata = {
            userEmail,
            pass,
          };
          socket.emit(msg.qrCode, userAuthdata);
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // Clear the interval if it was set
    if (intervalId != null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });
});
// app.use(
//   session({
//     secret: process.env.SECRET_KEY, // Replace with a strong secret key
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // Set to true if using HTTPS
//   })
// );

connectDB(process.env.DbPath);
//login
app.use("/api/auth/", authRoutes);
// app.use("/api/buget/",);
server.listen(port, () => {
  console.log(`Starting server at:- http://localhost:${port}/`);
});
