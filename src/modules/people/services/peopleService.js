import { peopleRepository } from "../repositories/peopleRepository.js";

export const peopleService = {
  async getAllPeople(query = {}) {
    return peopleRepository.findAll({ limit: query.limit });
  },

  async getPersonBySlug(slug) {
    const person = await peopleRepository.findBySlug(slug);

    if (!person) {
      const error = new Error("Person not found");
      error.statusCode = 404;
      throw error;
    }

    const filmography = await peopleRepository.findFilmographyByPersonId(
      person._id,
    );

    const normalizedAsCast = filmography.asCast.map((media) => {
      const targetPersonId = String(person._id);

      const matchedCastEntry = media.credits?.cast?.find((item) => {
        const currentId = item.person?._id ? item.person._id : item.person;
        return String(currentId) === targetPersonId;
      });

      return {
        _id: media._id,
        id: media.id,
        slug: media.slug,
        title: media.title,
        releaseYear: media.releaseYear,
        poster: media.poster,
        type: media.type,
        rating: media.rating,
        character: matchedCastEntry?.character || null,
      };
    });

    return {
      person,
      filmography: {
        asCast: normalizedAsCast,
        asDirector: filmography.asDirector,
        asWriter: filmography.asWriter,
      },
    };
  },
};
