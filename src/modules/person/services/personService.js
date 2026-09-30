import slugify from "slugify";
import { personRepository } from "../repositories/personRepository.js";
import { toPersonDetailsDto } from "../mappers/personMapper.js";
import { mediaService } from "../../media/services/mediaService.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "#shared/errors/AppError.js";
import { removeFileSafely } from "#shared/utils/file.util.js";
import { normalizePersonalRelationships } from "../utils/relationship.util.js";

const generateSlug = (nameEn) => {
  return slugify(String(nameEn || ""), {
    lower: true,
    strict: true,
    trim: true,
  });
};

const resolveUniqueSlugOptimized = async (baseSlug, currentId = null) => {
  const cleanBase = baseSlug || `person-${Date.now()}`;
  const existingDocs =
    await personRepository.findExistingSlugsByPrefix(cleanBase);

  if (!existingDocs.length) {
    return cleanBase;
  }

  const currentIdStr = currentId ? String(currentId) : null;
  const matchCurrent = existingDocs.find(
    (doc) => String(doc._id) === currentIdStr,
  );
  if (matchCurrent && matchCurrent.slug === cleanBase) {
    return cleanBase;
  }

  const existingSlugSet = new Set(existingDocs.map((d) => d.slug));
  if (!existingSlugSet.has(cleanBase)) {
    return cleanBase;
  }

  let counter = 1;
  while (existingSlugSet.has(`${cleanBase}-${counter}`)) {
    counter += 1;
  }

  return `${cleanBase}-${counter}`;
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

    let filmography = [];
    if (
      person.imdbId &&
      typeof mediaService?.getFilmographyByPersonImdbId === "function"
    ) {
      try {
        const filmographyResult =
          await mediaService.getFilmographyByPersonImdbId(person.imdbId, {
            limit: 100,
          });
        filmography = filmographyResult?.data ?? [];
      } catch {
        filmography = [];
      }
    }

    return {
      ...toPersonDetailsDto(person),
      filmography,
    };
  },

  async createPerson(payload) {
    if (payload.imdbId) {
      payload.imdbId = payload.imdbId.toLowerCase().trim();
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
    payload.slug = await resolveUniqueSlugOptimized(baseSlug);

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

    if (payload.imdbId) {
      payload.imdbId = payload.imdbId.toLowerCase().trim();
      if (payload.imdbId !== person.imdbId) {
        const existingImdb = await personRepository.findByImdbId(
          payload.imdbId,
        );
        if (existingImdb && String(existingImdb._id) !== String(id)) {
          throw new ConflictError(
            `Person with imdbId '${payload.imdbId}' already exists.`,
          );
        }
      }
    }

    if (payload.slug) {
      payload.slug = await resolveUniqueSlugOptimized(
        generateSlug(payload.slug),
        id,
      );
    } else if (payload.name?.en && payload.name.en !== person.name?.en) {
      payload.slug = await resolveUniqueSlugOptimized(
        generateSlug(payload.name.en),
        id,
      );
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
