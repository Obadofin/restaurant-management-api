require('dotenv').config({ path: './src/.env' });
const mongoose = require('mongoose');
const colors = require("colors");
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");
const PORT = process.env.PORT || 5000;
const app = express();


app.use(errorHandler);

app.use(cors());
app.use(express.json());

connectDB();


// Routes
app.use("/api/users", require("./routes/auth.routes"));



// Add a small check in your error handler
app.use((err, req, res, next) => {
  // If it's a CORS error, we might want to return 403 (Forbidden)
  const statusCode = err.message === "Not allowed by CORS" ? 403 : (err.statusCode || 500);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.yellow.underline);
});