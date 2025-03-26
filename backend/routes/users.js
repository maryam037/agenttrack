const express = require("express");
const UserModel = require("../models/User");
const authenticate = require("../utils/auth/authentication");
const { authorizeAdmin } = require("../utils/auth/authorization");
const router = express.Router();

// Fetch all users (admin only)
router.get("/fetchusers", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user status (admin only)
router.patch("/update-status/:userId", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete user (admin only)
router.delete("/delete/:userId", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;