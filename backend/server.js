const express = require("express");
const cors = require("cors");
const { PORT } = require("./config/env");

const githubRoutes = require("./routes/githubRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const aiRoutes = require("./routes/aiRoutes");
const AppError = require("./utils/appError");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "github-profile-analyzer-backend"
  });
});

app.use("/api/github", githubRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/ai-insights", aiRoutes);

app.all("*", (req, res, next) => {
  next(new AppError("Route not found", 404));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode
    }
  });
});

function startServer(port, attemptsLeft = 10) {
  const server = app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} is in use. Retrying on port ${nextPort}...`);
      startServer(nextPort, attemptsLeft - 1);
      return;
    }

    console.error("Failed to start backend server:", error.message);
    process.exit(1);
  });
}

startServer(Number(PORT));
