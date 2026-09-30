export const RELATIONSHIP_TYPE_MAP = Object.freeze({
  // Spouse variants
  spouse: "spouse",
  husband: "spouse",
  wife: "spouse",
  spouses: "spouse",

  // Partner variants
  partner: "partner",
  companion: "partner",
  "domestic partner": "partner",
  partners: "partner",

  // Parent variants
  parent: "parent",
  parents: "parent",
  father: "parent",
  mother: "parent",

  // Child variants
  children: "child",
  child: "child",
  son: "child",
  daughter: "child",

  // Sibling variants
  sibling: "sibling",
  siblings: "sibling",
  brother: "sibling",
  sister: "sibling",

  // Relative variants
  relatives: "relative",
  relative: "relative",
  family: "relative",
});

export const ALLOWED_RELATIONSHIP_TYPES = Object.freeze([
  "spouse",
  "partner",
  "parent",
  "child",
  "sibling",
  "relative",
]);

export const normalizeRelationshipType = (input) => {
  if (input == null) return "relative";
  const key = String(input).trim().toLowerCase();
  if (!key) return "relative";
  return (
    RELATIONSHIP_TYPE_MAP[key] ??
    (ALLOWED_RELATIONSHIP_TYPES.includes(key) ? key : "relative")
  );
};

export const normalizePersonalRelationships = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((r) => r && typeof r === "object")
    .map((r) => {
      const name = typeof r.name === "string" ? r.name.trim() : "";
      if (!name) return null;

      const rawImdb = typeof r.imdbId === "string" ? r.imdbId.trim() : "";
      const imdbId = /^nm\d+$/i.test(rawImdb) ? rawImdb.toLowerCase() : null;

      const attributes =
        typeof r.attributes === "string" && r.attributes.trim()
          ? r.attributes.trim()
          : null;

      return {
        type: normalizeRelationshipType(r.type),
        name,
        imdbId,
        attributes,
      };
    })
    .filter(Boolean);
};
