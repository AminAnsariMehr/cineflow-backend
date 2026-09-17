import fs from "fs/promises";
import path from "path";

export const removeFileSafely = async (relativeFilePath) => {
  if (!relativeFilePath || !relativeFilePath.startsWith("/uploads/")) return;
  try {
    const fullPath = path.resolve(`public${relativeFilePath}`);
    await fs.unlink(fullPath);
  } catch (err) {
    // فایل ممکن است وجود نداشته باشد، ارور ساپرس می‌شود
  }
};
