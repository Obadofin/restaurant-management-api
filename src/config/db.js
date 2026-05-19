const mongoose = require("mongoose"); // Mongoose library for connecting to MongoDB and defining schemas/models

// Connects the application to the MongoDB database using the URL from environment settings
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);  // Confirms successful connection with server address
  } catch (error) {
     console.error(`Error connecting to MongoDB: ${error.message}`.red.underline);  // Logs what went wrong in red for visibility
    process.exit(1);  // Shuts down the app immediately — can't run without a database
  }
};



module.exports = connectDB;