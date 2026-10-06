const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { testConnection } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const projectRoutes = require("./routes/projectRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// JSON
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.json({
    name: "SkillMatch API",
    database: "XAMPP MySQL/MariaDB",
    status: "running",
  });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await testConnection();

    res.json({
      api: "ok",
      database: "connected",
      database_type: "MySQL/MariaDB",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);

    res.status(500).json({
      api: "ok",
      database: "disconnected",
      error: error.message,
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/collaboration", collaborationRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

// Port
const PORT = Number(process.env.PORT || 5000);

// Start
async function startServer() {
  try {
    await testConnection();

    console.log("MySQL/XAMPP Connected Successfully");

    app.listen(PORT, () => {
      console.log(`SkillMatch API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed.");
    console.error(error.message);
    console.error(
      "Make sure XAMPP MySQL is running and .env is configured."
    );

    process.exit(1);
  }
}

startServer();