require("dotenv").config();
const express = require("express");
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authenticate = require("../utils/auth/authentication");
const { authorizeAdmin } = require("../utils/auth/authorization");

// Create initial admin account
router.post("/init-admin", async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await UserModel.findOne({ role: "admin" });
    if (adminExists) {
      return res.status(200).json({ message: "Admin already exists" });
    }

    // Create admin account with default credentials
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new UserModel({
      firstname: "Admin",
      lastname: "User",
      username: "admin",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "admin"
    });
    
    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ error: "Failed to create admin account" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email or username
    const user = await UserModel.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    // Check if user is blocked
    if (user.status === "inactive") {
      return res.status(403).json({ error: "User is blocked. Request an unblock." });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role,
        status: user.status 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { 
        id: user._id, 
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role, 
        status: user.status 
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, username, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: "User already exists with this email or username" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      role: role || 'user' // Allow role to be set if provided
    });
    
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: "Signup failed", 
      details: error.message 
    });
  }
});

module.exports = router;