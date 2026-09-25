import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "../src/app";
import { connectDB } from "../src/config/db";

let connecting: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  if (mongoose.connection.readyState === 0) {
    if (!connecting) connecting = connectDB();
    await connecting;
  }
  return (app as any)(req, res);
}