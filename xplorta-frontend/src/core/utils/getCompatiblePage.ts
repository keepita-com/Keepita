export type ApiPage = string | number | null | undefined;

export const getCompatiblePageNumber = (page: ApiPage | unknown): ApiPage => {
  if (page === null || page === undefined) {
    return page;
  } else if (typeof page === "string") {
    return new URLSearchParams(new URL(page).search).get("page") || page;
  } else if (typeof page === "number") {
    return page;
  }

  return 1;
};
