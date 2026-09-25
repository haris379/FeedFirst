import User from "../models/User";

/**
 * Makes sure the admin account described by ADMIN_EMAIL / ADMIN_PASSWORD in
 * .env exists and is up to date. Runs automatically on every server start
 * (see server.ts) so there is no separate "npm run seed" or
 * "npm run update-admin" step to remember.
 *
 * - If no user with ADMIN_EMAIL exists yet, it is created with role "admin".
 * - If it exists but its password no longer matches ADMIN_PASSWORD, the
 *   password is updated (re-hashed automatically by the User pre-save hook).
 * - If it exists but isn't role "admin", the role is corrected.
 */
export const ensureAdminUser = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.warn(
      "[ensureAdmin] ADMIN_EMAIL / ADMIN_PASSWORD not set in .env — skipping admin provisioning.",
    );
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!existing) {
    await User.create({ name, email: normalizedEmail, password, role: "admin" });
    console.log(`[ensureAdmin] Admin account created -> ${normalizedEmail}`);
    return;
  }

  let changed = false;

  if (existing.role !== "admin") {
    existing.role = "admin";
    changed = true;
  }

  const passwordMatches = await existing.comparePassword(password);
  if (!passwordMatches) {
    existing.password = password; // re-hashed by the pre-save hook in User.ts
    changed = true;
  }

  if (changed) {
    await existing.save();
    console.log(`[ensureAdmin] Admin account synced -> ${normalizedEmail}`);
  } else {
    console.log(`[ensureAdmin] Admin account up to date -> ${normalizedEmail}`);
  }
};
