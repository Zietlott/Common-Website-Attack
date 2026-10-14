const demoSession = require("./middleware/demo-session");
const csrfRoutes = require("./routes/csrf.routes");
const sqlInjectionRoutes = require("./routes/sql-injection.routes");
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const commentRoutes = require("./routes/comment.routes");

const app = express();

// Configure CORS
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5500",
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));
app.use(demoSession);

// Health check
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend server is running",
  });
});

// User APIs
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

// SQL Injection Lab
if (process.env.NODE_ENV === "development") {
  app.use("/api/labs/sqli", sqlInjectionRoutes);
}

// CSRF Lab
if (process.env.NODE_ENV === "development") {
  app.use("/api/labs/csrf", csrfRoutes);
}

// Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Backend error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
