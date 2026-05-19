require("dotenv").config({ path: ".env" });  // Loads secret settings (e.g., database password, port number) from a hidden file
const colors = require("colors");            // Adds color to console messages for easier reading
const connectDB = require("./config/db");    // Imports the database connection setup
const app = require("./app");                // Imports the main Express application

const PORT = process.env.PORT || 5000;       // Uses the port from environment settings, or defaults to 5000

// Connects to the database first, then starts the web server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.yellow.underline);  // Prints a colored message when the server is live
  });
});