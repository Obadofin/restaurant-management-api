require("dotenv").config({ path: ".env" });  // Loads secret settings (e.g., database password, JWT key) from a hidden file
const express = require("express"); // Express is the web framework that handles routing and server logic
const cors = require("cors"); // CORS middleware allows the frontend (e.g., website or mobile app) to communicate with this backend server even if they're on different addresses (e.g., localhost:3000 for frontend and localhost:5000 for backend)
const errorHandler = require("./middlewares/error.middleware"); // Custom middleware that catches errors from any route and sends a clean response back to the user instead of crashing the server

const app = express(); // Creates the Express application that will handle incoming requests and send responses

app.use(cors());           // Allows the frontend (e.g., website or mobile app) to talk to this server from a different address
app.use(express.json());     // Automatically converts incoming JSON data into usable JavaScript objects

// Route groups: directs requests to the right part of the application
app.use("/api/users", require("./routes/auth.routes"));       // Login, register, and account-related actions
app.use("/api/categories", require("./routes/category.routes")); // Food/menu categories (e.g., "Drinks", "Desserts")
app.use("/api/menu", require("./routes/menu.routes"));          // Individual food and drink items
app.use("/api/orders", require("./routes/order.routes"));       // Customer orders and status updates

// Catches any errors that slip through and sends a clean response back to the user
app.use(errorHandler);

module.exports = app;