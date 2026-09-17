// src/shared/utils/file.util.js
import fs from "fs/promises";
import path from "path";

export const removeFileSafely = async (relativeFilePath) => {
  // ۱. بررسی معتبر بودن ورودی
  if (!relativeFilePath || typeof relativeFilePath !== "string") return;

  try {
    // ۲. ساخت مسیر مطلق (Absolute Path) فایل هدف
    // استفاده از path.join برای جلوگیری از رفتارهای غیرمنتظره در سیستم‌عامل‌های مختلف
    const targetPath = path.resolve(path.join("public", relativeFilePath));

    // ۳. ساخت مسیر مطلق پوشه مجاز آپلود
    const allowedDirectory = path.resolve("public/uploads");

    // ۴. محافظت امنیتی (Path Traversal Protection)
    // بررسی می‌کنیم که آیا فایل هدف واقعاً داخل پوشه مجاز قرار دارد یا خیر
    if (!targetPath.startsWith(allowedDirectory)) {
      console.warn(
        `[Security Alert] Attempted Path Traversal detected: ${relativeFilePath}`,
      );
      return;
    }

    // ۵. حذف فایل در صورت عبور از لایه‌های امنیتی
    await fs.unlink(targetPath);
  } catch (error) {
    // اگر فایل وجود نداشت یا در دسترس نبود، نیازی نیست اپلیکیشن کرش کند یا به کاربر خطا بدهیم
    // می‌توانیم فقط در حالت Development لاگ کنیم
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[File Util] Failed to remove file: ${relativeFilePath}`,
        error.message,
      );
    }
  }
};
