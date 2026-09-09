// ====================================================================
// FILE: src/scripts/seed.js
// ====================================================================
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Person } from "../modules/people/models/Person.js";
import { Media } from "../modules/media/models/Media.js";

// --------------------------------------------------------------------
// 1. دیتاهای خام Person
// --------------------------------------------------------------------
const rawPeople = [
  {
    id: "person-christopher-nolan",
    slug: "christopher-nolan",
    name: { en: "Christopher Nolan", fa: "کریستوفر نولان" },
    biography: {
      en: "British-American film director, producer, and screenwriter known for his Hollywood blockbusters with complex storytelling.",
      fa: "کارگردان، تهیه‌کننده و فیلم‌نامه‌نویس بریتانیایی-آمریکایی که برای فیلم‌های بلاک‌باستری با روایت‌های پیچیده مشهور است.",
    },
    birthDate: new Date("1970-07-30"),
    birthPlace: { en: "London, England, UK", fa: "لندن، انگلستان" },
    primaryProfessions: ["director", "writer", "producer"],
    avatar: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
      alt: "Christopher Nolan",
    },
  },
  {
    id: "person-cillian-murphy",
    slug: "cillian-murphy",
    name: { en: "Cillian Murphy", fa: "کیلین مورفی" },
    biography: {
      en: "Irish actor known for his striking blue eyes and chameleon-like performances across stage and screen.",
      fa: "بازیگر ایرلندی که برای بازی‌های درخشان و چشمان نافذش در سینما و تئاتر شناخته می‌شود.",
    },
    birthDate: new Date("1976-05-25"),
    birthPlace: { en: "Douglas, Cork, Ireland", fa: "کورک، ایرلند" },
    primaryProfessions: ["actor"],
    avatar: {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      alt: "Cillian Murphy",
    },
  },
  {
    id: "person-leonardo-dicaprio",
    slug: "leonardo-dicaprio",
    name: { en: "Leonardo DiCaprio", fa: "لئوناردو دی‌کاپریو" },
    biography: {
      en: "American actor and producer known for his work in biopics and period films, receiving an Academy Award and numerous accolades.",
      fa: "بازیگر و تهیه‌کننده آمریکایی که برای بازی در آثار زندگی‌نامه‌ای و تاریخی تحسین‌های فراوانی کسب کرده است.",
    },
    birthDate: new Date("1974-11-11"),
    birthPlace: { en: "Los Angeles, California, USA", fa: "لس‌آنجلس، آمریکا" },
    primaryProfessions: ["actor", "producer"],
    avatar: {
      url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80",
      alt: "Leonardo DiCaprio",
    },
  },
  {
    id: "person-steven-knight",
    slug: "steven-knight",
    name: { en: "Steven Knight", fa: "استیون نایت" },
    biography: {
      en: "British screenwriter, television producer, and director known for creating Peaky Blinders.",
      fa: "فیلم‌نامه‌نویس و سازنده بریتانیایی، خالق سریال مشهور پیکی بلایندرز.",
    },
    birthDate: new Date("1959-08-05"),
    birthPlace: { en: "Marlborough, Wiltshire, UK", fa: "انگلستان" },
    primaryProfessions: ["writer", "director", "producer"],
    avatar: {
      url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80",
      alt: "Steven Knight",
    },
  },
  {
    id: "person-hayao-miyazaki",
    slug: "hayao-miyazaki",
    name: { en: "Hayao Miyazaki", fa: "هایائو میازاکی" },
    biography: {
      en: "Japanese animator, director, and co-founder of Studio Ghibli, celebrated as one of the greatest animation masters.",
      fa: "انیماتور، کارگردان افسانه‌ای ژاپنی و هم‌بنیان‌گذار استودیو جیبلی.",
    },
    birthDate: new Date("1941-01-05"),
    birthPlace: { en: "Tokyo, Japan", fa: "توکیو، ژاپن" },
    primaryProfessions: ["director", "writer"],
    avatar: {
      url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80",
      alt: "Hayao Miyazaki",
    },
  },
];

// --------------------------------------------------------------------
// 2. دیتاهای خام Media (با کلید personSlug به جای ObjectId)
// --------------------------------------------------------------------
const rawMedia = [
  {
    id: "media-oppenheimer-2023",
    slug: "oppenheimer-2023",
    type: "movie",
    title: { en: "Oppenheimer", fa: "اوپنهایمر" },
    originalTitle: "Oppenheimer",
    synopsis: {
      en: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
      fa: "داستان دانشمند آمریکایی جی. رابرت اوپنهایمر و نقشش در پروژه توسعه بمب اتمی منهتن.",
    },
    releaseYear: 2023,
    runtime: 180,
    genres: ["Biography", "Drama", "History"],
    countries: ["USA", "UK"],
    languages: ["English", "Persian", "دوبله فارسی"],
    poster: {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
      alt: "Oppenheimer Poster",
    },
    backdrop: {
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
      alt: "Oppenheimer Backdrop",
    },
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    rating: { imdb: 8.9 },
    isTop10: true,
    isUpcoming: false,
    credits: {
      cast: [
        {
          personSlug: "cillian-murphy",
          character: "J. Robert Oppenheimer",
          order: 1,
        },
      ],
      directors: ["christopher-nolan"],
      writers: ["christopher-nolan"],
    },
  },
  {
    id: "media-inception-2010",
    slug: "inception-2010",
    type: "movie",
    title: { en: "Inception", fa: "تلقین" },
    originalTitle: "Inception",
    synopsis: {
      en: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      fa: "یک دزد ماهر که اسرار شرکت‌ها را از طریق فناوری اشتراک‌گذاری خواب می‌دزدد، مامور کاشتن یک ایده در ذهن یک مدیرعامل می‌شود.",
    },
    releaseYear: 2010,
    runtime: 148,
    genres: ["Action", "Sci-Fi", "Adventure"],
    countries: ["USA", "UK"],
    languages: ["English", "فارسی"],
    poster: {
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
      alt: "Inception Poster",
    },
    backdrop: {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80",
      alt: "Inception Backdrop",
    },
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    rating: { imdb: 8.8 },
    isTop10: true,
    isUpcoming: false,
    credits: {
      cast: [
        {
          personSlug: "leonardo-dicaprio",
          character: "Dom Cobb",
          order: 1,
        },
        {
          personSlug: "cillian-murphy",
          character: "Robert Fischer",
          order: 2,
        },
      ],
      directors: ["christopher-nolan"],
      writers: ["christopher-nolan"],
    },
  },
  {
    id: "media-peaky-blinders",
    slug: "peaky-blinders",
    type: "series",
    title: { en: "Peaky Blinders", fa: "پیکی بلایندرز" },
    originalTitle: "Peaky Blinders",
    synopsis: {
      en: "A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.",
      fa: "حماسه یک خانواده گانگستری در انگلستان دهه ۱۹۰۰ به رهبری تامی شلبی خطرناک و باهوش.",
    },
    releaseYear: 2013,
    genres: ["Crime", "Drama"],
    countries: ["UK"],
    languages: ["English", "دوبله فارسی"],
    poster: {
      url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
      alt: "Peaky Blinders Poster",
    },
    backdrop: {
      url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80",
      alt: "Peaky Blinders Backdrop",
    },
    trailerUrl: "https://www.youtube.com/watch?v=oVzVdvGIC7U",
    rating: { imdb: 8.8 },
    isTop10: false,
    isUpcoming: false,
    seriesDetails: {
      totalSeasons: 6,
      totalEpisodes: 36,
      status: "ended",
    },
    credits: {
      cast: [
        {
          personSlug: "cillian-murphy",
          character: "Thomas Shelby",
          order: 1,
        },
      ],
      directors: [],
      writers: ["steven-knight"],
    },
  },
  {
    id: "media-spirited-away-2001",
    slug: "spirited-away-2001",
    type: "movie",
    title: { en: "Spirited Away", fa: "شهر اشباح" },
    originalTitle: "Sen to Chihiro no Kamikakushi",
    synopsis: {
      en: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
      fa: "دختربچه‌ای ۱۰ ساله در حین اسباب‌کشی خانواده‌اش وارد دنیایی مرموز از ارواح، خدایان و جادوگران می‌شود.",
    },
    releaseYear: 2001,
    runtime: 125,
    genres: ["Animation", "انیمیشن", "Adventure", "Family"],
    countries: ["Japan"],
    languages: ["Japanese", "Persian", "دوبله فارسی"],
    poster: {
      url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      alt: "Spirited Away Poster",
    },
    backdrop: {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
      alt: "Spirited Away Backdrop",
    },
    trailerUrl: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    rating: { imdb: 8.6 },
    isTop10: false,
    isUpcoming: false,
    credits: {
      cast: [],
      directors: ["hayao-miyazaki"],
      writers: ["hayao-miyazaki"],
    },
  },
  {
    id: "media-the-boy-and-the-heron-2023",
    slug: "the-boy-and-the-heron-2023",
    type: "movie",
    title: { en: "The Boy and the Heron", fa: "پسر و مرغ ماهی‌خوار" },
    originalTitle: "Kimitachi wa Dō Ikiru ka",
    synopsis: {
      en: "In the wake of his mother's death during World War II, a boy named Mahito moves to the countryside and discovers an abandoned tower.",
      fa: "پسری به نام ماهیتو پس از مرگ مادرش در جنگ جهانی دوم به حومه شهر می‌رود و وارد برجی متروکه و دنیایی جادویی می‌شود.",
    },
    releaseYear: 2023,
    runtime: 124,
    genres: ["Animation", "انیمیشن", "Adventure", "Drama"],
    countries: ["Japan"],
    languages: ["Japanese", "Persian", "دوبله فارسی"],
    poster: {
      url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
      alt: "The Boy and the Heron Poster",
    },
    backdrop: {
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
      alt: "The Boy and the Heron Backdrop",
    },
    rating: { imdb: 7.5 },
    isTop10: false,
    isUpcoming: false,
    credits: {
      cast: [],
      directors: ["hayao-miyazaki"],
      writers: ["hayao-miyazaki"],
    },
  },
];

// --------------------------------------------------------------------
// 3. اسکریپت اصلی اجرای سید
// --------------------------------------------------------------------
const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(env.mongoUri);
    console.log("Connected successfully.");

    console.log("Clearing existing data (People & Media)...");
    await Promise.all([Person.deleteMany({}), Media.deleteMany({})]);
    console.log("Existing data cleared.");

    // ۱. درج افراد و نگاشت slug به _id
    console.log("Seeding People...");
    const createdPeople = await Person.insertMany(rawPeople);

    // یک مپ سریع برای دسترسی O(1) به آیدی‌ها
    const personMap = new Map();
    createdPeople.forEach((person) => {
      personMap.set(person.slug, person._id);
    });
    console.log(`Successfully seeded ${createdPeople.length} people.`);

    // ۲. متصل کردن ObjectIdهای واقعی به فیلدهای credits در Media
    console.log("Transforming and Seeding Media...");
    const populatedMedia = rawMedia.map((item) => {
      const cast = (item.credits.cast || []).map((castMember) => {
        const personId = personMap.get(castMember.personSlug);
        if (!personId) {
          throw new Error(
            `Person slug not found for cast: ${castMember.personSlug}`,
          );
        }
        return {
          person: personId,
          character: castMember.character,
          order: castMember.order,
        };
      });

      const directors = (item.credits.directors || []).map((slug) => {
        const personId = personMap.get(slug);
        if (!personId) {
          throw new Error(`Person slug not found for director: ${slug}`);
        }
        return personId;
      });

      const writers = (item.credits.writers || []).map((slug) => {
        const personId = personMap.get(slug);
        if (!personId) {
          throw new Error(`Person slug not found for writer: ${slug}`);
        }
        return personId;
      });

      return {
        ...item,
        credits: {
          cast,
          directors,
          writers,
        },
      };
    });

    const createdMedia = await Media.insertMany(populatedMedia);
    console.log(`Successfully seeded ${createdMedia.length} media items.`);

    console.log("\n Seed completed successfully! Database is ready to use.");
    process.exit(0);
  } catch (error) {
    console.error(" Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
