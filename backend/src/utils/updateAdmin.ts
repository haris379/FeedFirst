import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";

dotenv.config();

const NEW_ADMIN_EMAIL = "adminfeedfirst@gmail.com";
const NEW_ADMIN_PASSWORD = "Xybf8B@G1846";

const run = async () => {
  await connectDB();
  const admin = await User.findOne({ role: "admin" });
  if (admin) {
    admin.email = NEW_ADMIN_EMAIL;
    admin.password = NEW_ADMIN_PASSWORD; // hashed automatically by User's pre-save hook
    await admin.save();
    console.log("Admin updated ->", NEW_ADMIN_EMAIL);
  } else {
    await User.create({
      name: "Admin",
      email: NEW_ADMIN_EMAIL,
      password: NEW_ADMIN_PASSWORD,
      role: "admin",
    });
    console.log("Admin created ->", NEW_ADMIN_EMAIL);
  }
  await mongoose.disconnect();
  process.exit(0);
};
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
