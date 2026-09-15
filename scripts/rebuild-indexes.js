// scripts/rebuild-indexes.js
import mongoose from "mongoose";
import { env } from "../src/config/env.js"; // یا مسیر فایل تنظیمات env پروژه شما

// ساختار نهایی و بهینه‌سازی‌شده ایندکس‌ها منطبق بر قانون ESR
const INDEX_DEFINITIONS = {
  media: [
    // ۱. اسلاگ یکتا
    {
      key: { slug: 1 },
      options: { unique: true, name: "uniq_slug" },
    },
    // ۲. سورت زمانی عمومی و صفحه‌بندی
    {
      key: { createdAt: -1, _id: -1 },
      options: { name: "idx_createdAt_id" },
    },
    // ۳. فیلتر نوع (فیلم / سریال) + سورت زمانی
    {
      key: { type: 1, createdAt: -1, _id: -1 },
      options: { name: "idx_type_createdAt_id" },
    },
    // ۴. فیلتر ژانر + سورت زمانی
    {
      key: { genres: 1, createdAt: -1, _id: -1 },
      options: { name: "idx_genres_createdAt_id" },
    },
    // ۵. فیلتر همزمان نوع و ژانر + سورت زمانی
    {
      key: { type: 1, genres: 1, createdAt: -1, _id: -1 },
      options: { name: "idx_type_genres_createdAt_id" },
    },
    // ۶. فیلتر زبان‌ها (دوبله فارسی) + سورت زمانی
    {
      key: { languages: 1, createdAt: -1, _id: -1 },
      options: { name: "idx_languages_createdAt_id" },
    },
    // ۷. ایندکس پارشیال خالص Top 10 (حذف کلید بولین از ایندکس)
    {
      key: {
        "rating.imdb": -1,
        "rating.voteCount": -1,
        createdAt: -1,
        _id: -1,
      },
      options: {
        name: "idx_top10_partial_sort",
        partialFilterExpression: { isTop10: true },
      },
    },
    // ۸. رتبه‌بندی عمومی Top IMDb
    {
      key: {
        "rating.imdb": -1,
        "rating.voteCount": -1,
        createdAt: -1,
        _id: -1,
      },
      options: { name: "idx_top_imdb_full_sort" },
    },
    // ۹. فیلم‌های آینده (Upcoming) با پارشیال خالص
    {
      key: { releaseYear: 1, createdAt: -1, _id: -1 },
      options: {
        name: "idx_upcoming_releaseYear_createdAt_id",
        partialFilterExpression: { isUpcoming: true },
      },
    },
    // ۱۰. فیلموگرافی و اعضای سازنده با پوشش کامل سورت و رفع In-Memory Sort
    {
      key: { "credits.directors": 1, releaseYear: -1, createdAt: -1, _id: -1 },
      options: { name: "idx_credits_directors_sort" },
    },
    {
      key: { "credits.writers": 1, releaseYear: -1, createdAt: -1, _id: -1 },
      options: { name: "idx_credits_writers_sort" },
    },
    {
      key: {
        "credits.cast.person": 1,
        releaseYear: -1,
        createdAt: -1,
        _id: -1,
      },
      options: { name: "idx_credits_cast_person_sort" },
    },
    // ۱۱. تایم‌لاین کالکشن‌ها و مجموعه‌ها
    {
      key: {
        "collectionInfo.collection": 1,
        "collectionInfo.order": 1,
        _id: 1,
      },
      options: { name: "idx_collection_order_id" },
    },
  ],

  seasons: [
    // ایندکس ترکیبی یکتا (پوشش‌دهنده کوئری‌های تک‌فیلدی mediaId به عنوان Leftmost Prefix)
    {
      key: { mediaId: 1, seasonNumber: 1 },
      options: { unique: true, name: "uniq_mediaId_seasonNumber" },
    },
  ],

  people: [
    // اسلاگ یکتا
    {
      key: { slug: 1 },
      options: { unique: true, name: "uniq_slug" },
    },
    // فیلتر حرفه + سورت نام انگلیسی + _id
    {
      key: { primaryProfessions: 1, "name.en": 1, _id: 1 },
      options: { name: "idx_professions_name_en_id" },
    },
    // سورت الفبایی نام انگلیسی عمومی
    {
      key: { "name.en": 1, _id: 1 },
      options: { name: "idx_name_en_id" },
    },
    // جستجو و سورت بر اساس نام فارسی
    {
      key: { "name.fa": 1, _id: 1 },
      options: { name: "idx_name_fa_id" },
    },
  ],

  collections: [
    {
      key: { slug: 1 },
      options: { unique: true, name: "uniq_slug" },
    },
    {
      key: { createdAt: -1, _id: -1 },
      options: { name: "idx_createdAt_id" },
    },
    {
      key: { "title.fa": "text", "title.en": "text" },
      options: { name: "txt_title_fa_en" },
    },
  ],
};

async function rebuildDatabaseIndexes() {
  const startTime = Date.now();
  console.log("\n=======================================================");
  console.log("🚀 شروع فرایند بازسازی و بهینه‌سازی ایندکس‌های MongoDB");
  console.log("=======================================================\n");

  try {
    const mongoUri = env.mongoUri || "mongodb://localhost:27017/cineflow";
    console.log(`🔌 در حال اتصال به دیتابیس: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log("✅ اتصال به MongoDB با موفقیت برقرار شد.\n");

    const db = mongoose.connection.db;

    for (const [collectionName, targetIndexes] of Object.entries(
      INDEX_DEFINITIONS,
    )) {
      console.log(`-------------------------------------------------------`);
      console.log(`📦 پردازش کالکشن: [ ${collectionName} ]`);
      console.log(`-------------------------------------------------------`);

      const collection = db.collection(collectionName);

      try {
        const existingIndexes = await collection.indexes();
        console.log(`🔍 ایندکس‌های فعلی (${existingIndexes.length} مورد):`);
        existingIndexes.forEach((idx) =>
          console.log(`   - ${idx.name}:`, JSON.stringify(idx.key)),
        );

        console.log(`\n🧹 در حال حذف ایندکس‌های قدیمی...`);
        await collection.dropIndexes();
        console.log(`✔ ایندکس‌های پیشین با موفقیت حذف شدند (به جز _id_).`);
      } catch (err) {
        if (err.codeName === "NamespaceNotFound") {
          console.log(`ℹ️ کالکشن هنوز سندی ندارد، مرحله حذف رد شد.`);
        } else {
          throw err;
        }
      }

      console.log(
        `\n⚡ در حال ساخت ${targetIndexes.length} ایندکس استاندارد جدید...`,
      );
      for (const indexDef of targetIndexes) {
        try {
          await collection.createIndex(indexDef.key, indexDef.options);
          console.log(`   ✔ ایجاد شد: ${indexDef.options.name}`);
        } catch (idxError) {
          console.error(
            `   ❌ خطا در ساخت ایندکس ${indexDef.options.name}:`,
            idxError.message,
          );
        }
      }

      const updatedIndexes = await collection.indexes();
      console.log(
        `\n📊 ایندکس‌های فعال جدید: [ ${updatedIndexes.map((i) => i.name).join(", ")} ]\n`,
      );
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("=======================================================");
    console.log(
      `✨ بازسازی ایندکس‌ها با موفقیت در مدت ${duration} ثانیه پایان یافت.`,
    );
    console.log("=======================================================\n");
  } catch (error) {
    console.error("\n❌ خطا در فرآیند Rebuild ایندکس‌ها:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔒 اتصال به دیتابیس بسته شد.");
    process.exit(0);
  }
}

rebuildDatabaseIndexes();
