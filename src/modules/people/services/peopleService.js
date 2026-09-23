import slugify from "slugify";
import { peopleRepository } from "../repositories/peopleRepository.js";
import {
  toPersonDetailsDto,
  toFilmographyItemDto,
} from "../mappers/peopleMapper.js";
import { Media } from "../../media/models/Media.js";
import { NotFoundError, ConflictError } from "#shared/errors/AppError.js";
import { removeFileSafely } from "#shared/utils/file.util.js";
import { normalizePersonalRelationships } from "../utils/relationship.util.js";

const generateSlug = (nameEn) => {
  return slugify(nameEn || "", {
    lower: true,
    strict: true,
    trim: true,
  });
};

export const peopleService = {
  async getAllPeople(queryParams) {
    const { items, pagination } = await peopleRepository.findAll(queryParams);
    return {
      data: items.map(toPersonDetailsDto),
      pagination,
    };
  },

  async getPersonBySlug(slug) {
    const person = await peopleRepository.findBySlug(slug);
    if (!person) {
      throw new NotFoundError(`Person with slug '${slug}' was not found.`);
    }

    // واکشی کارنامه هنری فرد از مدیاها
    const mediaList = await Media.find({
      $or: [
        { "credits.cast.person": person._id },
        { "credits.crew.person": person._id },
      ],
    })
      .sort({ releaseYear: -1, _id: -1 })
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
      const existingImdb = await peopleRepository.findByImdbId(payload.imdbId);
      if (existingImdb) {
        throw new ConflictError(
          `Person with imdbId '${payload.imdbId}' already exists.`,
        );
      }
    }

    let slug = payload.slug || generateSlug(payload.name?.en);
    const existingSlug = await peopleRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    if (payload.personalRelationships) {
      payload.personalRelationships = normalizePersonalRelationships(
        payload.personalRelationships,
      );
    }

    if (Array.isArray(payload.images)) {
      payload.images = payload.images.slice(0, 5);
    }

    const created = await peopleRepository.create({
      ...payload,
      slug,
    });

    return toPersonDetailsDto(created);
  },

  async updatePerson(id, payload) {
    const person = await peopleRepository.findById(id);
    if (!person) {
      throw new NotFoundError(`Person with id '${id}' was not found.`);
    }

    if (payload.imdbId && payload.imdbId !== person.imdbId) {
      const existingImdb = await peopleRepository.findByImdbId(payload.imdbId);
      if (existingImdb && String(existingImdb._id) !== String(id)) {
        throw new ConflictError(
          `Person with imdbId '${payload.imdbId}' already exists.`,
        );
      }
    }

    if (payload.name?.en && !payload.slug) {
      const nextSlug = generateSlug(payload.name.en);
      const existingSlug = await peopleRepository.findBySlug(nextSlug);
      if (existingSlug && String(existingSlug._id) !== String(id)) {
        payload.slug = `${nextSlug}-${Date.now()}`;
      } else {
        payload.slug = nextSlug;
      }
    }

    if (payload.avatar && person.avatar && payload.avatar !== person.avatar) {
      await removeFileSafely(person.avatar);
    }

    if (payload.personalRelationships) {
      payload.personalRelationships = normalizePersonalRelationships(
        payload.personalRelationships,
      );
    }

    if (Array.isArray(payload.images)) {
      payload.images = payload.images.slice(0, 5);
    }

    const updated = await peopleRepository.updateById(id, payload);
    return toPersonDetailsDto(updated);
  },

  async deletePerson(id) {
    const person = await peopleRepository.findById(id);
    if (!person) {
      throw new NotFoundError(`Person with id '${id}' was not found.`);
    }

    if (person.avatar) {
      await removeFileSafely(person.avatar);
    }

    await peopleRepository.deleteById(id);
    return { id, message: "Person deleted successfully." };
  },
};
