import slugify from "slugify";
import { personRepository } from "../repositories/personRepository.js";
import {
  toPersonDetailsDto,
  toFilmographyItemDto,
} from "../mappers/personMapper.js";
import { Media } from "../../media/models/Media.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "#shared/errors/AppError.js";
import { removeFileSafely } from "#shared/utils/file.util.js";
import { normalizePersonalRelationships } from "../utils/relationship.util.js";

const generateSlug = (nameEn) => {
  return slugify(nameEn || "", {
    lower: true,
    strict: true,
    trim: true,
  });
};

const resolveUniqueSlug = async (baseSlug, currentId = null) => {
  let slug = baseSlug || `person-${Date.now()}`;
  let counter = 0;

  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    const existing = await personRepository.findBySlug(candidate);

    if (
      !existing ||
      (currentId && String(existing._id) === String(currentId))
    ) {
      return candidate;
    }
    counter += 1;
  }
};

export const personService = {
  async getAllPerson(queryParams) {
    const { items, pagination } = await personRepository.findAll(queryParams);
    return {
      data: items.map(toPersonDetailsDto),
      pagination,
    };
  },

  async getPersonByIdentifier(identifier) {
    const person = await personRepository.findByIdentifier(identifier);
    if (!person) {
      throw new NotFoundError(
        `Person with identifier '${identifier}' was not found.`,
      );
    }

    // بهینه‌سازی پرفورمنس: فچ کردن فقط فیلدهای مورد نیاز و اعمال لیمیت برای جلوگیری از سرریز حافظه
    const mediaList = await Media.find({
      $or: [
        { "credits.cast.person": person._id },
        { "credits.crew.person": person._id },
      ],
    })
      .select({
        slug: 1,
        type: 1,
        title: 1,
        originalTitle: 1,
        releaseYear: 1,
        assets: 1,
        rating: 1,
        "credits.cast": 1,
        "credits.crew": 1,
      })
      .sort({ releaseYear: -1, _id: -1 })
      .limit(100)
      .lean();

    const filmography = mediaList.map((m) =>
      toFilmographyItemDto(m, person._id),
    );

    return {
      ...toPersonDetailsDto(person),
      filmography,
    };
  },

  async createPerson(payload) {
    if (payload.imdbId) {
      const existingImdb = await personRepository.findByImdbId(payload.imdbId);
      if (existingImdb) {
        throw new ConflictError(
          `Person with imdbId '${payload.imdbId}' already exists.`,
        );
      }
    }

    const baseSlug = payload.slug
      ? generateSlug(payload.slug)
      : generateSlug(payload.name?.en);
    payload.slug = await resolveUniqueSlug(baseSlug);

    if (payload.personalRelationships) {
      payload.personalRelationships = normalizePersonalRelationships(
        payload.personalRelationships,
      );
    }

    if (Array.isArray(payload.images)) {
      payload.images = payload.images.slice(0, 5);
    }

    try {
      const created = await personRepository.create(payload);
      return toPersonDetailsDto(created);
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictError(
          "A person with the provided unique field (imdbId or slug) already exists.",
        );
      }
      throw err;
    }
  },

  async updatePerson(id, payload) {
    const person = await personRepository.findById(id);
    if (!person) {
      throw new NotFoundError(`Person with id '${id}' was not found.`);
    }

    if (payload.imdbId && payload.imdbId !== person.imdbId) {
      const existingImdb = await personRepository.findByImdbId(payload.imdbId);
      if (existingImdb && String(existingImdb._id) !== String(id)) {
        throw new ConflictError(
          `Person with imdbId '${payload.imdbId}' already exists.`,
        );
      }
    }

    if (payload.name?.en && !payload.slug) {
      const baseSlug = generateSlug(payload.name.en);
      payload.slug = await resolveUniqueSlug(baseSlug, id);
    } else if (payload.slug) {
      const baseSlug = generateSlug(payload.slug);
      payload.slug = await resolveUniqueSlug(baseSlug, id);
    }

    if (payload.personalRelationships) {
      payload.personalRelationships = normalizePersonalRelationships(
        payload.personalRelationships,
      );
    }

    if (Array.isArray(payload.images)) {
      payload.images = payload.images.slice(0, 5);
    }

    const oldAvatar = person.avatar;

    try {
      const updated = await personRepository.updateById(id, payload);

      // درستی تراکنش: حذف عکس قبلی صرفاً پس از موفقیت قطعی آپدیت در دیتابیس
      if (payload.avatar && oldAvatar && payload.avatar !== oldAvatar) {
        await removeFileSafely(oldAvatar);
      }

      return toPersonDetailsDto(updated);
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictError("Conflict with existing slug or IMDb ID.");
      }
      throw err;
    }
  },

  async deletePerson(id) {
    const person = await personRepository.findById(id);
    if (!person) {
      throw new NotFoundError(`Person with id '${id}' was not found.`);
    }

    await personRepository.deleteById(id);

    if (person.avatar) {
      await removeFileSafely(person.avatar);
    }

    return { id, message: "Person deleted successfully." };
  },
};
