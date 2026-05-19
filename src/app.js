<<<<<<< HEAD
require('dotenv').config();
const mongoose = require('mongoose');
const colors = require("colors");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");
=======
require("dotenv").config({ path: ".env" });  // Loads secret settings (e.g., database password, JWT key) from a hidden file
const express = require("express"); // Express is the web framework that handles routing and server logic
const cors = require("cors"); // CORS middleware allows the frontend (e.g., website or mobile app) to communicate with this backend server even if they're on different addresses (e.g., localhost:3000 for frontend and localhost:5000 for backend)
const errorHandler = require("./middlewares/error.middleware"); // Custom middleware that catches errors from any route and sends a clean response back to the user instead of crashing the server
>>>>>>> a8b3611aaacfb0b51fd98bcbf3fb74b2e3059a56

const app = express(); // Creates the Express application that will handle incoming requests and send responses

app.use(cors());           // Allows the frontend (e.g., website or mobile app) to talk to this server from a different address
app.use(express.json());     // Automatically converts incoming JSON data into usable JavaScript objects

// Routes
app.use("/api/users", require("./routes/auth.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/tables", require("./routes/table.routes"));
app.use("/api/reservations", require("./routes/reservation.routes"));
app.use("/api/payments", require("./routes/payment.routes"));

// Catches any errors that slip through and sends a clean response back to the user
app.use(errorHandler);

module.exports = app;