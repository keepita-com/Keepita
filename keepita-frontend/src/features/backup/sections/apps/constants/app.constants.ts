/**
 * App Constants
 * Defines sort options based on backend ordering_fields
 */

// Local SortOption interface to match the Samsung component
interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: "asc" | "desc";
}

// App sort options based on backend ordering_fields: ['apk_name', 'size', 'last_time_used', 'created_at']
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

// Default sort configuration
export const DEFAULT_APP_SORT_CONFIG = {
  field: "apk_name",
  direction: "asc" as const,
};
