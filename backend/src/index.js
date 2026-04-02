import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from "cookie-parser";
import cloudinary from "./lib/cloudinary.js";
import adminRoutes from "./routes/admin.route.js";
import applicationRoutes from "./routes/application.route.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import notificationRoutes from "./routes/notification.route.js";
import opportunityRoutes from "./routes/opportunity.route.js";
import organisationRoutes from "./routes/organisation.route.js";
import userRoutes from "./routes/user.route.js";
import volunteerRoutes from "./routes/volunteer.route.js";

dotenv.config();
const app = express();

// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT;

app.use(cors({
    origin: 'http://localhost:5173', // frontend origin
    credentials: true
}));

// define api routes
app.use("/api/admin", adminRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/opportunity", opportunityRoutes);
app.use("/api/organisation", organisationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/volunteer", volunteerRoutes);

// check if port is connected to backend
app.listen(PORT, () => {
    console.log('Server is running on port:', PORT); // backend port
    connectDB();
});

// uncomment the testCloudinary() below to check if cloudinary is connected, else should be left commented
// async function testCloudinary() {
//   try {
//     const res = await cloudinary.api.ping();
//     console.log("Cloudinary connected:", res);
//   } catch (err) {
//     console.error("Cloudinary failed:", err.message);
//   } 
// }
// testCloudinary();