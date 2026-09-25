import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Category from "../models/Category";
import Product from "../models/Product";
import DeliverySettings from "../models/DeliverySettings";

dotenv.config();

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    DeliverySettings.deleteMany({}),
  ]);

  console.log("Creating admin & demo customer...");
  await User.create({
    name: "BirdFeast Admin",
    email: "adminfeedfirst@gmail.com",
    password: "Xybf8B@G1846",
    role: "admin",
  });
  

  console.log("Creating categories...");
  const categoryNames = ["Seeds", "Grains", "Nuts", "Mixed Blends"];
  const categories = await Category.insertMany(
    categoryNames.map((name) => ({ name, slug: slugify(name), isActive: true }))
  );
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  console.log("Creating products...");
  const products = [
    { name: "Millet", category: "Seeds", price: 220, unit: "kg", stock: 100, sku: "MIL-001", description: "Small, energy-rich seed loved by finches and budgies.", featured: true },
    { name: "Sunflower Seeds", category: "Seeds", price: 380, unit: "kg", stock: 100, sku: "SUN-001", description: "High-fat seed great for parrots and larger birds.", featured: true },
    { name: "Canary Seed", category: "Seeds", price: 260, unit: "kg", stock: 80, sku: "CAN-001", description: "Staple seed for canaries and finches.", featured: false },
    { name: "Corn", category: "Grains", price: 180, unit: "kg", stock: 120, sku: "COR-001", description: "Cracked corn, a filling grain for larger birds.", featured: false },
    { name: "Sorghum", category: "Grains", price: 170, unit: "kg", stock: 90, sku: "SOR-001", description: "Economical grain used as a mixture base.", featured: false },
    { name: "Peanuts", category: "Nuts", price: 420, unit: "kg", stock: 60, sku: "PEA-001", description: "Shelled peanuts, a rich treat high in protein.", featured: true },
    { name: "Safflower", category: "Seeds", price: 340, unit: "kg", stock: 70, sku: "SAF-001", description: "Hard-shelled seed favored by cardinals, less by squirrels.", featured: false },
    { name: "Oats", category: "Grains", price: 200, unit: "kg", stock: 100, sku: "OAT-001", description: "Rolled oats for a soft, digestible filler.", featured: false },
    { name: "Mixed Wild Seed", category: "Mixed Blends", price: 250, unit: "kg", stock: 150, sku: "MWS-001", description: "General-purpose blend for a wide variety of birds.", featured: true },
    { name: "Pine Nuts", category: "Nuts", price: 900, unit: "kg", stock: 30, sku: "PIN-001", description: "Premium treat nut, used sparingly in custom blends.", featured: false },
    { name: "Flaxseed", category: "Seeds", price: 310, unit: "kg", stock: 50, sku: "FLA-001", description: "Omega-rich seed, a healthy addition to any mix.", featured: false },
  ];
  await Product.insertMany(
    products.map((p) => ({ ...p, category: catByName[p.category], image: "", status: "active" }))
  );

  console.log("Creating delivery settings (weight-based advance-payment rule)...");
  await DeliverySettings.create({
    baseDeliveryFee: 250,
    weightThresholdKg: 3,
    minimumOrderAmount: 0,
    cityFees: [
      { city: "Lahore", fee: 0 },
      { city: "Karachi", fee: 150 },
      { city: "Islamabad", fee: 100 },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login:    admin@birdfeast.com / Admin@123");
  console.log("Customer login: customer@birdfeast.com / Customer@123");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
