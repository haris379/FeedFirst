import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";
import { notFound, errorHandler } from "./middleware/errorHandler";
import path from "path";

import uploadRoutes from "./routes/uploadRoutes";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";
import addressRoutes from "./routes/addressRoutes";
import geocodeRoutes from "./routes/geocodeRoutes";
import contactRoutes from "./routes/contactRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/geocode", geocodeRoutes);

// Basic rate limiting on auth endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "BirdFeast API is running" }),
);

app.use(notFound);
app.use(errorHandler);

export default app;
