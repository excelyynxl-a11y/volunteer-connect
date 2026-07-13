export const validAgeGroups = ["21-30", "31-40", "41-50", "51-60", "60+"];

export const parseArrayField = (fieldValue) => {
  if (fieldValue === undefined) {
    return undefined;
  }

  if (Array.isArray(fieldValue)) {
    return fieldValue;
  }

  if (typeof fieldValue === "string") {
    try {
      return JSON.parse(fieldValue);
    } catch {
      return fieldValue;
    }
  }

  return fieldValue;
};

export const normalizeSkills = (skills) => [
  ...new Set(
    skills
      .map((skill) => String(skill).trim())
      .filter(Boolean),
  ),
];
