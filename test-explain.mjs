// test-explain.mjs
import "dotenv/config"; // این روش برای import کردن دات‌اِنو در ES Modules است
import mongoose from "mongoose";
import { Media } from "./src/modules/media/models/Media.js";

// حتما پسوند .js را داشته باشد

async function runTest() {
  try {
    // اتصال به دیتابیس (مطمئن شو MONGODB_URI در فایل .env هست)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // اجرای کوئری
    const result = await Media.find({
      isTop10: true,
      "rating.imdb": { $exists: true, $ne: null },
    })
      .sort({
        "rating.imdb": -1,
        "rating.voteCount": -1,
        createdAt: -1,
        _id: -1,
      })
      .explain("executionStats");

    console.log("=== Execution Stats ===");
    // نمایش مرحله‌بندی و آمار اجرا
    console.log(JSON.stringify(result.executionStats, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

runTest();
