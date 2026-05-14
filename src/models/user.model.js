// Import mongoose for creating schemas and models
const mongoose = require("mongoose");
// Import bcrypt for hashing passwords securely
const bcrypt = require("bcryptjs");
// Import predefined user roles from our constants file
const { ROLES } = require("../core/constants");

// Blueprint for how a user account is stored in the database
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,    // Must provide a name when signing up
    },
    email: {
      type: String,
      required: true,    // Must provide an email
      unique: true,      // No two accounts can share the same email address
    },
    password: {
      type: String,
      required: true,    // Must set a password (stored securely, not plain text)
    },
    roles: [
      {
        type: String,
        enum: Object.values(ROLES),  // Only allows valid roles: "customer", "admin", or "staff"
        default: ROLES.CUSTOMER,     // New sign-ups automatically become customers
      },
    ],
  },
  { timestamps: true },  // Auto-adds createdAt and updatedAt dates for tracking
);

// Runs automatically before saving: scrambles the password so it can't be stolen if the database is hacked
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;  // Skip if password hasn't changed (e.g., updating name only)

  this.password = await bcrypt.hash(this.password, 10);  // Turns "mypassword123" into unreadable gibberish
});

// Checks if the password someone typed matches the scrambled one we stored
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);  // Returns true if they match, false otherwise
};

module.exports = mongoose.model("User", userSchema);