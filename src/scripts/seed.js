import mongoose from "mongoose";
import { env } from "./../config/env.js";
import { Media } from "./../modules/media/models/Media.js";
import { Person } from "./../modules/people/models/Person.js";
import { rawPeople } from "./rawPeople.js";
import { rawMedia } from "./rawMedia.js";

const runSeed = async () => {
  let exitCode = 0;

  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // ۱. پاک‌سازی داده‌های قبلی
    await Media.deleteMany({});
    await Person.deleteMany({});
    console.log("Existing collections cleared.");

    // ۲. اصلاح تطبیق فیلدهای People با Schema و ساخت ID
    const normalizedPeople = rawPeople.map((person, index) => ({
      id: person.id || `person_${index + 1}`,
      slug: person.slug,
      name: person.name,
      biography: person.bio || person.biography || { en: "", fa: "" },
      birthDate: person.birthDate || null,
      deathDate: person.deathDate || null,
      birthPlace:
        typeof person.birthPlace === "string"
          ? { en: person.birthPlace, fa: person.birthPlace }
          : person.birthPlace || { en: "", fa: "" },
      avatar:
        typeof person.avatar === "string"
          ? person.avatar
          : person.avatar?.url || "",
      primaryProfessions: person.knownFor || person.primaryProfessions || [],
    }));

    const createdPeople = await Person.insertMany(normalizedPeople);
    console.log(`Inserted ${createdPeople.length} people.`);

    // ۳. نگاشت مپ بر اساس Slug برای انتساب سریع O(1)
    const personMap = new Map();
    for (const p of createdPeople) {
      personMap.set(p.slug, p._id);
    }

    // ۴. نرمال‌سازی Media با حل فیلد id اجباری و تطبیق ساختار پوستر
    const normalizedMedia = rawMedia.map((media, index) => {
      const cast = (media.credits?.cast || [])
        .filter((c) => personMap.has(c.personSlug))
        .map((c) => ({
          person: personMap.get(c.personSlug),
          character: c.character || "",
          order: c.order || 0,
        }));

      const directors = (media.credits?.directors || [])
        .filter((slug) => personMap.has(slug))
        .map((slug) => personMap.get(slug));

      const writers = (media.credits?.writers || [])
        .filter((slug) => personMap.has(slug))
        .map((slug) => personMap.get(slug));

      return {
        ...media,
        id: media.id || `media_${index + 1}`,
        summary: media.synopsis || media.summary,
        poster: {
          vertical: media.poster?.url || media.poster?.vertical || "",
          horizontal: media.backdrop?.url || media.poster?.horizontal || "",
          backdrop: media.backdrop?.url || media.poster?.backdrop || "",
        },
        credits: { cast, directors, writers },
      };
    });

    const createdMedia = await Media.insertMany(normalizedMedia);
    console.log(`Inserted ${createdMedia.length} media items.`);

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
    exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(exitCode);
  }
};

runSeed();
