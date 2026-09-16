export const MEDIA_LIST_PROJECTION = {
  _id: 1,
  slug: 1,
  type: 1,
  title: 1,
  originalTitle: 1,
  releaseYear: 1,
  ageRating: 1,
  duration: 1,
  genres: 1,
  countries: 1,
  languages: 1,
  assets: 1,
  rating: 1,
  seriesDetails: 1,
  isTop10: 1,
  isUpcoming: 1,
  isExclusive: 1,
};

export const MEDIA_DETAILS_PROJECTION = {
  ...MEDIA_LIST_PROJECTION,
  summary: 1,
  credits: 1,
  collections: 1,
  createdAt: 1,
  updatedAt: 1,
};

export const PERSON_SUMMARY_PROJECTION = {
  _id: 1,
  slug: 1,
  name: 1,
  avatar: 1,
};

export const COLLECTION_SUMMARY_PROJECTION = {
  _id: 1,
  slug: 1,
  title: 1,
  summary: 1,
  assets: 1,
};

export const COLLECTION_TIMELINE_PROJECTION = {
  _id: 1,
  slug: 1,
  title: 1,
  releaseYear: 1,
  type: 1,
  "assets.poster": 1,
  collections: 1,
};

export const mediaListProjection = MEDIA_LIST_PROJECTION;
export const mediaDetailsProjection = MEDIA_DETAILS_PROJECTION;
