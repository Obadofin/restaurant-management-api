const mongoose = require("mongoose");

// Blueprint for how a food/drink item is stored in the database
const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,    // Must have a name — cannot be empty
      trim: true,        // Removes extra spaces from the start and end automatically
    },
    description: {
      type: String,      // Optional text explaining what's in the dish
      trim: true,        // Cleans up extra spaces
    },
    price: {
      type: Number,
      required: true,    // Must have a price
      min: 0,            // Cannot be negative (no freebies or debt items)
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,  // Links to a Category record by its ID
      ref: "Category",                       // Tells MongoDB which collection to look up
      required: true,                        // Every item must belong to a category
    },
    isAvailable: {
      type: Boolean,
      default: true,     // New items are automatically available unless marked otherwise
    },
    image: {
      type: String,      // Optional URL or path to the item's photo
    },
  },
  { timestamps: true },  // Auto-adds createdAt and updatedAt dates for tracking
);

module.exports = mongoose.model("MenuItem", menuItemSchema);