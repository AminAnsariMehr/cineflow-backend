import { getEntityId, toPlainObject } from "#shared/mongoose/entityId.js";
import { normalizeRelationshipType } from "../utils/relationship.util.js";

export const toPersonDetailsDto = (personDoc) => {
  const person = toPlainObject(personDoc);
  if (!person) return null;

  return {
    imdbId: person.imdbId ?? "",
    slug: person.slug ?? "",
    name: {
      en: person.name?.en ?? "",
      fa: person.name?.fa ?? "",
    },
    birthName: person.birthName ?? null,
    birthDate: person.birthDate ?? null,
    deathDate: person.deathDate ?? null,
    birthPlace: {
      en: person.birthPlace?.en ?? "",
      fa: person.birthPlace?.fa ?? "",
    },
    height: typeof person.height === "number" ? person.height : null,
    biography: {
      en: person.biography?.en ?? "",
      fa: person.biography?.fa ?? "",
    },
    primaryProfessions: {
      en: Array.isArray(person.primaryProfessions?.en)
        ? person.primaryProfessions.en
        : [],
      fa: Array.isArray(person.primaryProfessions?.fa)
        ? person.primaryProfessions.fa
        : [],
    },
    starmeterRank:
      typeof person.starmeterRank === "number" ? person.starmeterRank : null,
    awardsSummary: {
      oscarWins: person.awardsSummary?.oscarWins ?? 0,
      oscarNominations: person.awardsSummary?.oscarNominations ?? 0,
      totalWins: person.awardsSummary?.totalWins ?? 0,
      totalNominations: person.awardsSummary?.totalNominations ?? 0,
    },
    personalRelationships: Array.isArray(person.personalRelationships)
      ? person.personalRelationships.map((rel) => ({
          type: normalizeRelationshipType(rel?.type),
          name: rel?.name ?? "",
          imdbId: rel?.imdbId ?? null,
          attributes: rel?.attributes ?? null,
        }))
      : [],
    avatar: person.avatar ?? "",
    images: Array.isArray(person.images) ? person.images.slice(0, 5) : [],
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
