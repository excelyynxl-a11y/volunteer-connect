import { randomUUID } from "node:crypto";

import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import adminRoutes from "./routes/admin.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import applicationRoutes from "./routes/application.route.js";
import authRoutes from "./routes/auth.route.js";
import followRoutes from "./routes/follow.route.js";
import messageRoutes from "./routes/message.route.js";
import notificationRoutes from "./routes/notification.route.js";
import opportunityRoutes from "./routes/opportunity.route.js";
import organisationRoutes from "./routes/organisation.route.js";
import recommendationRoutes from "./routes/recommendation.route.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.route.js";
import volunteerRoutes from "./routes/volunteer.route.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  const requestId = req.get("X-Request-ID") || randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});
app.use("/api", apiRateLimiter);
app.use("/api/auth", authRateLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());

if (isProduction) {
  app.set("trust proxy", 1);
} else {
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    }),
  );
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/health/ready", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not ready",
    database: ready ? "connected" : "disconnected",
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/organisation", organisationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/report", reportRoutes);

if (isProduction) {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const frontendDirectory = path.resolve(
    currentDirectory,
    "../../frontend/dist",
  );

  app.use(express.static(frontendDirectory));
  app.use((req, res, next) => {
    const isApiRequest = req.path === "/api" || req.path.startsWith("/api/");

    if (req.method !== "GET" || isApiRequest) {
      return next();
    }

    return res.sendFile(path.join(frontendDirectory, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
}

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  console.error(`[${req.requestId || "unknown"}] Unhandled request error:`, error.message);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : "Internal Server Error",
    requestId: req.requestId,
  });
});

export default app;
