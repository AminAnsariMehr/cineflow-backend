import { getEntityId, toPlainObject } from "#shared/mongoose/entityId.js";

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

  // جستجو در عوامل پشت صحنه (کارگردان، نویسنده، و ...)
  const matchedCrew = media.credits?.crew?.filter((crewMember) => {
    const crewPersonId = crewMember?.person?._id ?? crewMember?.person;
    return crewPersonId && String(crewPersonId) === targetId;
  });

  return {
    id: getEntityId(media),
    slug: media.slug,
    type: media.type,
    title: media.title,
    originalTitle: media.originalTitle ?? "",
    releaseYear: media.releaseYear,
    poster:
      typeof media.assets?.poster?.vertical === "string"
        ? media.assets.poster.vertical
        : typeof media.assets?.poster === "string"
          ? media.assets.poster
          : null,
    rating: media.rating ?? null,
    asCast: matchedCast
      ? {
          character: matchedCast.character ?? null,
          order: matchedCast.order ?? 0,
        }
      : null,
    asCrew: matchedCrew?.length
      ? matchedCrew.map((c) => ({ job: c.job, department: c.department }))
      : null,
  };
};
