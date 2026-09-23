export const RELATIONSHIP_TYPE_MAP = {
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
};

export const ALLOWED_RELATIONSHIP_TYPES = [
  "spouse",
  "partner",
  "parent",
  "child",
  "sibling",
  "relative",
];

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
    .map((r) => {
      if (!r || typeof r !== "object") return null;

      const type = normalizeRelationshipType(r.type);
      const name = typeof r.name === "string" ? r.name.trim() : (r.name ?? "");
      const imdbId =
        typeof r.imdbId === "string" ? r.imdbId.trim() : (r.imdbId ?? null);
      const attributes =
        typeof r.attributes === "string"
          ? r.attributes.trim()
          : (r.attributes ?? null);

      if (!name) return null;

      return {
        type,
        name,
        imdbId: imdbId || null,
        attributes: attributes || null,
      };
    })
    .filter(Boolean);
};
