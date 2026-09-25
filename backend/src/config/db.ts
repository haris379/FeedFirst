import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Throwing (instead of process.exit) matters on Vercel: exiting the
    // process there kills the whole function invocation and shows up as an
    // opaque "500 FUNCTION_INVOCATION_FAILED" with no detail. Throwing lets
    // the caller (api/index.ts locally, or the traditional server) log/handle
    // it as a normal error.
    const message = "MONGODB_URI is not defined in the environment";
    console.error(message);
    throw new Error(message);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};
