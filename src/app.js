require('dotenv').config();
const mongoose = require('mongoose');
const colors = require("colors");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/auth.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/orders", require("./routes/order.routes"));

// Error handler
app.use(errorHandler);

module.exports = app;
