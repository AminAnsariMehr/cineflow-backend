// تست کوئریِ اصلی برای Top 10
import mongoose from "mongoose";
import { Media } from "#modules/media/models/Media";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cineflow";

async function runExplainTest() {
  try {
    console.log("🔌 در حال اتصال به دیتابیس...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ اتصال برقرار شد.\n");

    console.log("🔍 در حال اجرای Explain روی کوئری Top 10...");

    const explainResult = await Media.find({ isTop10: true })
      .sort({
        "rating.imdb": -1,
        "rating.voteCount": -1,
        createdAt: -1,
        _id: -1,
      })
      .limit(10)
      .explain("executionStats");

    const stats = explainResult.executionStats;
    const stages = stats.executionStages;

    // تابع کمکی بازگشتی برای پیدا کردن stageهای عمیق‌تر در درخت اجرا
    function extractStages(stageObj) {
      const found = [stageObj.stage];
      if (stageObj.inputStage) {
        found.push(...extractStages(stageObj.inputStage));
      }
      if (stageObj.inputStages) {
        for (const s of stageObj.inputStages) {
          found.push(...extractStages(s));
        }
      }
      return found;
    }

    const allStages = extractStages(stages);
    const hasBlockingSort = allStages.includes("SORT");

    console.log("=========================================");
    console.log("📊 نتیجه تحلیل عملکرد (Execution Stats):");
    console.log("=========================================");
    console.log(`⏱️ زمان اجرا (ms): ${stats.executionTimeMillis}`);
    console.log(`📄 تعداد کل اسناد برگشتی (nReturned): ${stats.nReturned}`);
    console.log(
      `🔎 تعداد کلیدهای اسکن‌شده ایندکس (totalKeysExamined): ${stats.totalKeysExamined}`,
    );
    console.log(
      `📦 تعداد داکیومنت‌های اسکن‌شده (totalDocsExamined): ${stats.totalDocsExamined}`,
    );
    console.log(
      `🌲 درخت استیج‌ها (Execution Pipeline): ${allStages.join(" ➔ ")}`,
    );
    console.log("-----------------------------------------");

    if (hasBlockingSort) {
      console.log("❌ هشدار: هنوز مرحله Blocking SORT در حافظه وجود دارد!");
    } else {
      console.log(
        "🚀 فوق‌العاده! هیچ استیج Blocking SORT وجود ندارد و سورت مستقیماً از روی ایندکس خوانده شد (Non-blocking / Pipelined).",
      );
    }

    // استخراج ایندکس استفاده شده
    let current = stages;
    while (current && !current.indexName && current.inputStage) {
      current = current.inputStage;
    }
    if (current && current.indexName) {
      console.log(`🎯 ایندکس استفاده شده: [ ${current.indexName} ]`);
    }

    console.log("=========================================\n");
  } catch (err) {
    console.error("❌ خطا در اجرای تست:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔒 اتصال به دیتابیس بسته شد.");
    process.exit(0);
  }
}

runExplainTest();
