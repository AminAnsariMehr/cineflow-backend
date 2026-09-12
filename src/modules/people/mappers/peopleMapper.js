export const toPersonDetailsDto = (personDoc) => ({
  id: personDoc.id,
  slug: personDoc.slug,
  name: personDoc.name,
  biography: personDoc.biography,
  birthDate: personDoc.birthDate,
  deathDate: personDoc.deathDate,
  birthPlace: personDoc.birthPlace,
  avatar: personDoc.avatar,
  primaryProfessions: personDoc.primaryProfessions || [],
});

export const toFilmographyItemDto = (mediaDoc, personObjectId) => {
  const targetIdStr = String(personObjectId);

  const matchedCast = mediaDoc.credits?.cast?.find(
    (c) => String(c.person?._id || c.person) === targetIdStr,
  );
  const isDirector = mediaDoc.credits?.directors?.some(
    (d) => String(d._id || d) === targetIdStr,
  );
  const isWriter = mediaDoc.credits?.writers?.some(
    (w) => String(w._id || w) === targetIdStr,
  );

  return {
    id: mediaDoc.id,
    slug: mediaDoc.slug,
    type: mediaDoc.type,
    title: mediaDoc.title,
    originalTitle: mediaDoc.originalTitle,
    releaseYear: mediaDoc.releaseYear,
    poster:
      mediaDoc.assets?.poster?.vertical || mediaDoc.assets?.poster || null,
    rating: mediaDoc.rating,
    asCast: matchedCast ? { character: matchedCast.character } : null,
    asDirector: Boolean(isDirector),
    asWriter: Boolean(isWriter),
  };
};
