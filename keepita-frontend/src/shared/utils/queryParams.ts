export const buildQueryParams = (
  params: Record<string, any>,
): Record<string, any> => {
  const queryParams: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
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

export const buildQueryParamsWithDefaults = (
  params: Record<string, any>,
  defaults: Record<string, any> = {},
): Record<string, any> => {
  const mergedParams = { ...defaults, ...params };
  return buildQueryParams(mergedParams);
};
