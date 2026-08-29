const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export const parsePagination = (query = {}) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? DEFAULT_PAGE_SIZE);

  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new Error(`Limit must be an integer between 1 and ${MAX_PAGE_SIZE}`);
  }

  return { page, limit, skip: (page - 1) * limit };
};
