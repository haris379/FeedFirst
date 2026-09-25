import multer from "multer";
import path from "path";
import fs from "fs";

import { ApiError } from "./errorHandler";

const uploadDir = path.join(__dirname, "..", "..", "uploads");
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  // On Vercel (and most serverless platforms) the filesystem is read-only
  // outside of /tmp, so this throws EROFS. Previously this ran at import
  // time with no try/catch, which crashed the entire app module — taking
  // down every route, not just uploads — the moment app.ts imported
  // uploadRoutes. Swallow it here and let an actual upload attempt fail
  // on its own instead of killing the whole function on cold start.
  console.warn(
    "Could not create uploads directory (read-only filesystem?). " +
      "Image uploads will not work until this is backed by external " +
      "storage (e.g. Vercel Blob, S3, Cloudinary) instead of local disk.",
    err,
  );
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    return cb(
      new ApiError(
        400,
        "Only image files (jpg, png, webp, gif) are allowed",
      ) as any,
    );
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
