const mongoose = require("mongoose");
function connectDB(url) {
  return mongoose
    .connect(url)
    .then(() => console.log("Connected!"))
    .catch((e) => {
      console.log(`Error in connecting database ${e}`);
      throw new Error(e);
    });
}
module.exports = connectDB;
