const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../core/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: [
      {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.CUSTOMER,
      },
    ],
  },
  { timestamps: true },
);

//hash password before save to db
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// compare hasshed password with user input
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
