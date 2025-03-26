require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth");
const ReviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");
const analyticsRoutes = require("./routes/analysis");

// Add rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Add compression
const compression = require("compression");
app.use(compression());

// Add helmet for security headers
const helmet = require("helmet");
app.use(helmet());

// Update CORS to use env variables
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(","),
  credentials: true,
  exposedHeaders: ["Authorization"]
};
// Add to route middleware
app.use("/api/analysis", cors(corsOptions), analyticsRoutes);
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(express.json());
// Mongodb Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));
// Routes
app.use("/api/auth", cors(corsOptions), authRoutes);
app.use("/api/reviews", cors(corsOptions), ReviewsRoutes);
app.use("/api/users", cors(corsOptions), usersRoutes);
app.get("/", (req, res) => {
  res.send("Hello Server is Running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
