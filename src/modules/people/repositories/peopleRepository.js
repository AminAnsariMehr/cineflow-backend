import { Person } from "../models/Person.js";
import { normalizePagination } from "#shared/utils/pagination.util.js";

const PERSON_PUBLIC_PROJECTION = {
  _id: 1,
  slug: 1,
  name: 1,
  biography: 1,
  birthDate: 1,
  deathDate: 1,
  birthPlace: 1,
  avatar: 1,
  primaryProfessions: 1,
  createdAt: 1,
  updatedAt: 1,
};

const normalizeStringQuery = (value) => {
  if (typeof value !== "string") return null;
  const normalizedValue = value.trim();
  return normalizedValue || null;
};

export const peopleRepository = {
  async findAll(query = {}) {
    const filter = {};
    const { profession, search } = query;
    const normalizedProfession = normalizeStringQuery(profession);
    const normalizedSearch = normalizeStringQuery(search);

    // مقادیر پیش‌فرض برای Projection و Sort
    let projection = { ...PERSON_PUBLIC_PROJECTION };
    let sortCriteria = { "name.en": 1, _id: 1 };

    if (normalizedProfession) {
      filter.primaryProfessions = normalizedProfession;
    }

    if (normalizedSearch) {
      // استفاده از $text به جای $or و $regex برای استفاده از ایندکس و پرفورمنس بالا
      filter.$text = { $search: normalizedSearch };

      // اضافه کردن متای score برای اینکه بتوانیم بر اساس ارتباط و تطابق نتیجه سورت کنیم
      projection.score = { $meta: "textScore" };

      // تغییر Sort: نتایجی که تطابق بیشتری با کلمه سرچ شده دارند بالاتر قرار می‌گیرند
      sortCriteria = { score: { $meta: "textScore" } };
    }

    const { page, limit, skip } = normalizePagination(query);

    const [items, totalItems] = await Promise.all([
      Person.find(filter)
        .select(projection)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      Person.countDocuments(filter),
    ]);

    return { items, totalItems, page, limit };
  },

  async findBySlug(slug) {
    return Person.findOne({ slug }).select(PERSON_PUBLIC_PROJECTION).lean();
  },

  async findById(id) {
    return Person.findById(id).select(PERSON_PUBLIC_PROJECTION).lean();
  },

  async create(payload) {
    const person = new Person(payload);
    await person.save();
    return person.toObject(); // چون متد save خروجی lean ندارد، با toObject یک ابجکت سبک جاوااسکریپتی برمی‌گردانیم
  },

  async updateById(id, payload) {
    return Person.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true },
    )
      .select(PERSON_PUBLIC_PROJECTION)
      .lean();
  },

  async deleteById(id) {
    return Person.findByIdAndDelete(id).lean();
  },
};
