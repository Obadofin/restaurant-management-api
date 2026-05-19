const mongoose = require("mongoose");

// Blueprint for how a product category is stored in the database
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,      // Text only
      required: true,    // Must have a name — cannot be empty
      unique: true,      // No two categories can share the same name (e.g., only one "Electronics")
      trim: true,        // Removes extra spaces from the start and end automatically
    },
    description: {
      type: String,      // Optional text explaining what this category is for
      trim: true,        // Also cleans up extra spaces
    },
  },
  { timestamps: true },  // Auto-adds createdAt and updatedAt dates for tracking
);

module.exports = mongoose.model("Category", categorySchema);