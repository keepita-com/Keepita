/**
 * Build query parameters for API calls, filtering out undefined/null/empty values
 * This is a reusable utility that can be used across all sections
 */
export const buildQueryParams = (
  params: Record<string, any>
): Record<string, any> => {
  const queryParams: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    // Filter out undefined, null, empty strings, and empty arrays
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      // For string values, trim whitespace
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          queryParams[key] = trimmedValue;
        }
      } else {
        queryParams[key] = value;
      }
    }
  });

  return queryParams;
};

/**
 * Build query parameters with default pagination values
 */
export const buildQueryParamsWithDefaults = (
  params: Record<string, any>,
  defaults: Record<string, any> = {}
): Record<string, any> => {
  const mergedParams = { ...defaults, ...params };
  return buildQueryParams(mergedParams);
};
