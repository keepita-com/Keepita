import {
  Image,
  Video,
  Music,
  FileText,
  Smartphone,
  Archive,
  File,
  FileImage,
  FileVideo,
  FileAudio2,
  FileCheck,
  Settings,
} from "lucide-react";
import type { FileCategory } from "../types/myFiles.types";

export const FILE_ICONS = {
  image: {
    default: "FileImage",
    jpg: "FileImage",
    jpeg: "FileImage",
    png: "FileImage",
    gif: "FileImage",
    svg: "FileImage",
    webp: "FileImage",
    bmp: "FileImage",
    ico: "FileImage",
  },

  video: {
    default: "FileVideo",
    mp4: "FileVideo",
    avi: "FileVideo",
    mov: "FileVideo",
    wmv: "FileVideo",
    flv: "FileVideo",
    webm: "FileVideo",
    mkv: "FileVideo",
    m4v: "FileVideo",
  },

  audio: {
    default: "FileAudio2",
    mp3: "FileAudio2",
    wav: "FileAudio2",
    flac: "FileAudio2",
    aac: "FileAudio2",
    ogg: "FileAudio2",
    wma: "FileAudio2",
    m4a: "FileAudio2",
  },

  document: {
    default: "FileText",
    pdf: "FileCheck",
    doc: "FileText",
    docx: "FileText",
    xls: "FileText",
    xlsx: "FileText",
    ppt: "FileText",
    pptx: "FileText",
    txt: "FileText",
    rtf: "FileText",
  },

  apk: {
    default: "Smartphone",
    apk: "Smartphone",
  },

  zip: {
    default: "Archive",
    zip: "Archive",
    rar: "Archive",
    "7z": "Archive",
    tar: "Archive",
    gz: "Archive",
  },

  other: {
    default: "File",
    json: "FileText",
    xml: "FileText",
    csv: "FileText",
    exe: "Settings",
  },
} as const;

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "image":
      return Image;
    case "video":
      return Video;
    case "audio":
      return Music;
    case "document":
      return FileText;
    case "apk":
      return Smartphone;
    case "zip":
      return Archive;
    default:
      return File;
  }
};

export const getFileIcon = (extension: string, category?: string) => {
  const ext = extension.toLowerCase();

  if (category && FILE_ICONS[category as keyof typeof FILE_ICONS]) {
    const categoryIcons = FILE_ICONS[
      category as keyof typeof FILE_ICONS
    ] as Record<string, string>;
    if (categoryIcons[ext]) {
      return getIconComponent(categoryIcons[ext]);
    }
    return getIconComponent(categoryIcons.default);
  }

  for (const cat of Object.keys(FILE_ICONS)) {
    const categoryIcons = FILE_ICONS[cat as keyof typeof FILE_ICONS] as Record<
      string,
      string
    >;
    if (categoryIcons[ext]) {
      return getIconComponent(categoryIcons[ext]);
    }
  }

  return File;
};

const getIconComponent = (iconName: string) => {
  const iconMap = {
    FileImage,
    FileVideo,
    FileAudio2,
    FileText,
    FileCheck,
    Smartphone,
    Archive,
    File,
    Settings,
    Image,
    Video,
    Music,
  };

  return iconMap[iconName as keyof typeof iconMap] || File;
};

export const ONE_UI_COLORS = {
  primary: {
    50: "#E3F2FD",
    100: "#BBDEFB",
    200: "#90CAF9",
    300: "#64B5F6",
    400: "#42A5F5",
    500: "#2196F3",
    600: "#1E88E5",
    700: "#1976D2",
    800: "#1565C0",
    900: "#0D47A1",
  },

  samsung: {
    blue: "#1C5EBA",
    lightBlue: "#7BB3FF",
    darkBlue: "#0D2A5C",
    green: "#00C853",
    red: "#FF1744",
    orange: "#FF9800",
    purple: "#9C27B0",
    teal: "#00BCD4",
  },

  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },

  background: {
    light: "#FFFFFF",
    lightGray: "#F8F9FA",
    gray: "#F5F5F5",
    dark: "#121212",
  },

  text: {
    primary: "#1C1C1E",
    secondary: "#6C6C70",
    tertiary: "#8E8E93",
    disabled: "#C7C7CC",
    inverse: "#FFFFFF",
  },

  status: {
    success: "#00C853",
    warning: "#FF9800",
    error: "#FF1744",
    info: "#2196F3",
  },

  surface: {
    background: "#FFFFFF",
    card: "#FFFFFF",
    elevated: "#FFFFFF",
    disabled: "#F5F5F5",
  },

  border: {
    light: "#E0E0E0",
    medium: "#BDBDBD",
    dark: "#757575",
  },
} as const;

export const ONE_UI_SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  elevated: "0 8px 32px rgba(0, 0, 0, 0.12)",
} as const;

export const ONE_UI_SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

export const ONE_UI_BORDER_RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "50%",
} as const;

export const FILE_CATEGORY_COLORS = {
  image: ONE_UI_COLORS.samsung.green,
  video: ONE_UI_COLORS.samsung.red,
  audio: ONE_UI_COLORS.samsung.purple,
  document: ONE_UI_COLORS.samsung.blue,
  other: ONE_UI_COLORS.neutral[600],
} as const;

export const MY_FILES_SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "file_name", icon: "ArrowUpAZ" },
  { label: "Name (Z-A)", value: "-file_name", icon: "ArrowDownZA" },
  { label: "Size (Large to Small)", value: "-file_size", icon: "ArrowDown" },
  { label: "Size (Small to Large)", value: "file_size", icon: "ArrowUp" },
  {
    label: "Date Created (Newest)",
    value: "-created_date",
    icon: "CalendarArrowDown",
  },
  {
    label: "Date Created (Oldest)",
    value: "created_date",
    icon: "CalendarArrowUp",
  },
  {
    label: "Date Modified (Newest)",
    value: "-modified_date",
    icon: "ClockArrowDown",
  },
  {
    label: "Date Modified (Oldest)",
    value: "modified_date",
    icon: "ClockArrowUp",
  },
] as const;

export const MY_FILES_SORT_FIELDS = {
  NAME: "file_name",
  SIZE: "file_size",
  CREATED_DATE: "created_date",
  MODIFIED_DATE: "modified_date",
} as const;

export const MY_FILES_SORT_ORDERS = {
  ASC: "",
  DESC: "-",
} as const;

export const MY_FILES_CATEGORY_FILTERS: {
  key: FileCategory;
  label: string;
  icon: React.ComponentType<any>;
}[] = [
  { key: "image", label: "Images", icon: getCategoryIcon("image") },
  { key: "video", label: "Videos", icon: getCategoryIcon("video") },
  { key: "audio", label: "Audio", icon: getCategoryIcon("audio") },
  { key: "document", label: "Documents", icon: getCategoryIcon("document") },
  { key: "apk", label: "APK Files", icon: getCategoryIcon("apk") },
  { key: "zip", label: "ZIP Files", icon: getCategoryIcon("zip") },
];

export const MY_FILES_SIZE_FILTERS = [
  { label: "All Sizes", value: null, min: undefined, max: undefined },
  { label: "Small (< 1 MB)", value: "small", min: undefined, max: 1048576 },
  { label: "Medium (1-10 MB)", value: "medium", min: 1048576, max: 10485760 },
  { label: "Large (10-100 MB)", value: "large", min: 10485760, max: 104857600 },
  {
    label: "Very Large (> 100 MB)",
    value: "xlarge",
    min: 104857600,
    max: undefined,
  },
] as const;

export const MY_FILES_EXTENSION_FILTERS: Record<FileCategory, string[]> = {
  image: ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"],

  video: ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"],

  audio: ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"],

  document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf"],

  apk: ["apk"],

  zip: ["zip", "rar", "7z", "tar", "gz"],
};

export const MY_FILES_VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
} as const;

export const MY_FILES_VIEW_MODE_OPTIONS = [
  { value: "grid", label: "Grid View", icon: "Grid3X3" },
  { value: "list", label: "List View", icon: "List" },
] as const;

export const MY_FILES_PAGE_SIZE_OPTIONS = [
  { label: "12 per page", value: 12 },
  { label: "24 per page", value: 24 },
  { label: "48 per page", value: 48 },
  { label: "96 per page", value: 96 },
] as const;

export const MY_FILES_DEFAULT_PAGE_SIZE = 24;

export const MY_FILES_SEARCH_PLACEHOLDER =
  "Search files by name, extension, or category...";
export const MY_FILES_SEARCH_DEBOUNCE_MS = 300;

export const getCategoryDisplayName = (category: FileCategory): string => {
  const categoryItem = MY_FILES_CATEGORY_FILTERS.find(
    (cat) => cat.key === category,
  );
  return categoryItem ? categoryItem.label : category;
};

export const getSortDisplayName = (ordering: string): string => {
  const sortOption = MY_FILES_SORT_OPTIONS.find(
    (option) => option.value === ordering,
  );
  return sortOption ? sortOption.label : "Custom Sort";
};

export const getFileSizeCategory = (sizeInBytes: number): string => {
  if (sizeInBytes < 1048576) return "small";
  if (sizeInBytes < 10485760) return "medium";
  if (sizeInBytes < 104857600) return "large";
  return "xlarge";
};

export const isValidFileExtension = (
  extension: string,
  category?: FileCategory,
): boolean => {
  const ext = extension.toLowerCase();

  if (!category) {
    return Object.values(MY_FILES_EXTENSION_FILTERS).some((extensions) =>
      extensions.includes(ext),
    );
  }

  const categoryExtensions = MY_FILES_EXTENSION_FILTERS[category];
  return categoryExtensions ? categoryExtensions.includes(ext) : false;
};
