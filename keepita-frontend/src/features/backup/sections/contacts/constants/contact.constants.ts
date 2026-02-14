export const CONTACT_SORT_OPTIONS = [
  {
    value: "name",
    label: "Name (A-Z)",
    field: "name" as const,
    direction: "asc" as const,
  },
  {
    value: "-name",
    label: "Name (Z-A)",
    field: "name" as const,
    direction: "desc" as const,
  },
  {
    value: "-is_favorite",
    label: "Favorites First",
    field: "is_favorite" as const,
    direction: "desc" as const,
  },
  {
    value: "is_favorite",
    label: "Favorites Last",
    field: "is_favorite" as const,
    direction: "asc" as const,
  },
] as const;

export const CONTACT_FILTER_OPTIONS = [
  {
    key: "is_favorite",
    label: "Favorites",
    icon: "heart",
  },
  {
    key: "has_image",
    label: "With Photo",
    icon: "image",
  },
] as const;

export const CONTACT_ACTIONS = {
  CALL: "call",
  MESSAGE: "message",
  EMAIL: "email",
  EDIT: "edit",
  DELETE: "delete",
  TOGGLE_FAVORITE: "toggle_favorite",
} as const;

export const CONTACT_FILTERS = {
  ALL: "all",
  FAVORITES: "favorites",
  WITH_PHOTOS: "with_photos",
  WITH_BIRTHDAYS: "with_birthdays",
} as const;

export const CONTACT_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
} as const;

export const CONTACT_SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
} as const;

export const CONTACT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const CONTACT_VALIDATION = {
  NAME_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  PHONE_MIN_LENGTH: 7,
} as const;

export const CONTACT_DEFAULTS = {
  AVATAR_FALLBACK: "Unknown",
  PHONE_FALLBACK: "No phone",
  NAME_FALLBACK: "Unknown Contact",
} as const;
