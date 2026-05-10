require("dotenv").config({ path: ".env" });
const colors = require("colors");
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.yellow.underline);
  });
});
