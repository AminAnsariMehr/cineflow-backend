import { peopleRepository } from "../repositories/peopleRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { mediaService } from "../../media/services/mediaService.js";
import { toPersonDetailsDto } from "../mappers/peopleMapper.js";

const normalizeSlug = (slug) => {
  if (typeof slug !== "string") {
    return "";
  }

  return slug.trim().toLowerCase();
};

export const peopleService = {
  async getAllPeople(query = {}) {
    const people = await peopleRepository.findAll(query);
    return people.map(toPersonDetailsDto);
  },

  async getPersonBySlug(slug, query = {}) {
    const normalizedSlug = normalizeSlug(slug);

    if (!normalizedSlug) {
      throw new NotFoundError("Person slug is required");
    }

    const person = await peopleRepository.findBySlug(normalizedSlug);

    if (!person) {
      throw new NotFoundError(`Person with slug '${normalizedSlug}' not found`);
    }

    const filmography = await mediaService.getFilmographyByPersonId(
      person._id,
      query,
    );

    return {
      person: toPersonDetailsDto(person),
      filmography,
    };
  },
};
