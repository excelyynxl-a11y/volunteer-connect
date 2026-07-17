import path from "node:path";
import { fileURLToPath } from "node:url";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import adminRoutes from "./routes/admin.route.js";
import applicationRoutes from "./routes/application.route.js";
import authRoutes from "./routes/auth.route.js";
import followRoutes from "./routes/follow.route.js";
import messageRoutes from "./routes/message.route.js";
import notificationRoutes from "./routes/notification.route.js";
import opportunityRoutes from "./routes/opportunity.route.js";
import organisationRoutes from "./routes/organisation.route.js";
import reportRoutes from "./routes/report.route.js";
import userRoutes from "./routes/user.route.js";
import volunteerRoutes from "./routes/volunteer.route.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

if (isProduction) {
  app.set("trust proxy", 1);
} else {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/organisation", organisationRoutes);
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

export default app;
