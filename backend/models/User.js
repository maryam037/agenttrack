const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" , immutable: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

const UserModel = mongoose.model("Users", UserSchema);
module.exports = UserModel;