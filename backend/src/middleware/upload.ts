import multer from "multer";
import { ApiError } from "./errorHandler";

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
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
