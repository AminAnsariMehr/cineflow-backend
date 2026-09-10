import { peopleRepository } from "../repositories/peopleRepository.js";
import { mediaRepository } from "../../media/repositories/mediaRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import {
  toPersonDetailsDto,
  toFilmographyItemDto,
} from "../mappers/peopleMapper.js";

export const peopleService = {
  async getAllPeople(query) {
    const people = await peopleRepository.findAll(query);
    return people.map(toPersonDetailsDto);
  },

  async getPersonBySlug(slug) {
    const person = await peopleRepository.findBySlug(slug);
    if (!person) {
      throw new NotFoundError(`Person with slug '${slug}' not found`);
    }

    const rawFilmography = await mediaRepository.findFilmographyByPersonId(
      person._id,
    );

    return {
      person: toPersonDetailsDto(person),
      filmography: rawFilmography.map((media) =>
        toFilmographyItemDto(media, person._id),
      ),
    };
  },
};
