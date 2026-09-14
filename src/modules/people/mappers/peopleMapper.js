import { getEntityId, toPlainObject } from "#shared/mongoose/entityId";

export const toPersonDetailsDto = (personDoc) => {
  const person = toPlainObject(personDoc);
  if (!person) return null;

  return {
    id: getEntityId(person),
    slug: person.slug,
    name: person.name,
    biography: person.biography ?? {
      fa: "",
      en: "",
    },
    birthDate: person.birthDate ?? null,
    deathDate: person.deathDate ?? null,
    birthPlace: person.birthPlace ?? {
      fa: "",
      en: "",
    },
    avatar: person.avatar ?? "",
    primaryProfessions: Array.isArray(person.primaryProfessions)
      ? person.primaryProfessions
      : [],
  };
};

export const toFilmographyItemDto = (mediaDoc, personObjectId) => {
  const media = toPlainObject(mediaDoc);
  if (!media) return null;

  const targetId = String(personObjectId);

  const matchedCast = media.credits?.cast?.find((castMember) => {
    const castPersonId = castMember?.person?._id ?? castMember?.person;

    return castPersonId && String(castPersonId) === targetId;
  });

  const isDirector = media.credits?.directors?.some((director) => {
    const directorId = director?._id ?? director;
    return directorId && String(directorId) === targetId;
  });

  const isWriter = media.credits?.writers?.some((writer) => {
    const writerId = writer?._id ?? writer;
    return writerId && String(writerId) === targetId;
  });

  return {
    id: getEntityId(media),
    slug: media.slug,
    type: media.type,
    title: media.title,
    originalTitle: media.originalTitle ?? "",
    releaseYear: media.releaseYear,
    poster: media.assets?.poster?.vertical || media.assets?.poster || null,
    rating: mediaDoc.rating ?? null,
    asCast: matchedCast
      ? {
          character: matchedCast.character ?? null,
          order: matchedCast.order ?? 0,
        }
      : null,
    asDirector: Boolean(isDirector),
    asWriter: Boolean(isWriter),
  };
};
