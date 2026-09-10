export const normalizeLimit = (value, defaultLimit = 20, maxLimit = 100) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return defaultLimit;
  }
  return Math.min(parsed, maxLimit);
};
