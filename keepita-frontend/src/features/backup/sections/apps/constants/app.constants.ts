interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: "asc" | "desc";
}

export const APP_SORT_OPTIONS: SortOption[] = [
  {
    value: "apk_name",
    label: "Name (A-Z)",
    field: "apk_name",
    direction: "asc",
  },
  {
    value: "-apk_name",
    label: "Name (Z-A)",
    field: "apk_name",
    direction: "desc",
  },
  {
    value: "size",
    label: "Size (Smallest)",
    field: "size",
    direction: "asc",
  },
  {
    value: "-size",
    label: "Size (Largest)",
    field: "size",
    direction: "desc",
  },
  {
    value: "last_time_used",
    label: "Last Used (Oldest)",
    field: "last_time_used",
    direction: "asc",
  },
  {
    value: "-last_time_used",
    label: "Last Used (Recent)",
    field: "last_time_used",
    direction: "desc",
  },
  {
    value: "created_at",
    label: "Created (Oldest)",
    field: "created_at",
    direction: "asc",
  },
  {
    value: "-created_at",
    label: "Created (Newest)",
    field: "created_at",
    direction: "desc",
  },
];

export const DEFAULT_APP_SORT_CONFIG = {
  field: "apk_name",
  direction: "asc" as const,
};
