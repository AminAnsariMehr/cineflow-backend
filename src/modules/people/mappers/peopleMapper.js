export const toPersonDetailsDto = (personDoc) => ({
  id: personDoc.id ?? personDoc._id?.toString?.() ?? null,
  slug: personDoc.slug,
  name: personDoc.name,
  biography: personDoc.biography ?? {
    fa: "",
    en: "",
  },
  birthDate: personDoc.birthDate ?? null,
  deathDate: personDoc.deathDate ?? null,
  birthPlace: personDoc.birthPlace ?? {
    fa: "",
    en: "",
  },
  avatar: personDoc.avatar ?? "",
  primaryProfessions: Array.isArray(personDoc.primaryProfessions)
    ? personDoc.primaryProfessions
    : [],
});

export const toFilmographyItemDto = (mediaDoc, personObjectId) => {
  const targetId = String(personObjectId);

  const matchedCast = mediaDoc.credits?.cast?.find((castMember) => {
    const castPersonId = castMember?.person?._id ?? castMember?.person;

    return castPersonId && String(castPersonId) === targetId;
  });

  const isDirector = mediaDoc.credits?.directors?.some((director) => {
    const directorId = director?._id ?? director;
    return directorId && String(directorId) === targetId;
  });

  const isWriter = mediaDoc.credits?.writers?.some((writer) => {
    const writerId = writer?._id ?? writer;
    return writerId && String(writerId) === targetId;
  });

  return {
    id: mediaDoc.id ?? mediaDoc._id?.toString?.() ?? null,
    slug: mediaDoc.slug,
    type: mediaDoc.type,
    title: mediaDoc.title,
    originalTitle: mediaDoc.originalTitle ?? "",
    releaseYear: mediaDoc.releaseYear,
    poster:
      mediaDoc.assets?.poster?.vertical || mediaDoc.assets?.poster || null,
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
