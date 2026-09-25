import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectDB } from "./config/db";
import { ensureAdminUser } from "./utils/ensureAdmin";

const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  await ensureAdminUser();
  app.listen(PORT, () =>
    console.log(`BirdFeast API listening on port ${PORT}`),
  );
});
