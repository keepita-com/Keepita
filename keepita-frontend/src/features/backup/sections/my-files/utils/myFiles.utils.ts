import type {
  MyFile,
  FileCategory,
  GetMyFilesParams,
} from "../types/myFiles.types";
import { buildQueryParams } from "../../../../../shared/utils";

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

export const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
};

export const isImageFile = (file: MyFile): boolean => {
  return file.category === "image" || file.mime_type.startsWith("image/");
};

export const isVideoFile = (file: MyFile): boolean => {
  return file.category === "video" || file.mime_type.startsWith("video/");
};

export const isAudioFile = (file: MyFile): boolean => {
  return file.category === "audio" || file.mime_type.startsWith("audio/");
};

export const isDocumentFile = (file: MyFile): boolean => {
  return (
    file.category === "document" ||
    file.mime_type.includes("pdf") ||
    file.mime_type.includes("document") ||
    file.mime_type.includes("text")
  );
};

export const getCategoryFromMimeType = (
  mimeType: string,
  extension?: string,
): FileCategory => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  )
    return "document";

  if (extension === "apk") return "apk";

  if (extension && ["zip", "rar", "7z", "tar", "gz"].includes(extension))
    return "zip";

  return "zip";
};

export const filterFilesByCategory = (
  files: MyFile[],
  categories: FileCategory[],
): MyFile[] => {
  if (categories.length === 0) return files;
  return files.filter((file) => categories.includes(file.category));
};

export const sortFiles = (
  files: MyFile[],
  field: "name" | "size" | "date" | "type",
  order: "asc" | "desc" = "asc",
): MyFile[] => {
  const sorted = [...files].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "name":
        comparison = a.file_name.localeCompare(b.file_name);
        break;
      case "size":
        comparison = a.file_size - b.file_size;
        break;
      case "date":
        comparison =
          new Date(a.created_date).getTime() -
          new Date(b.created_date).getTime();
        break;
      case "type":
        comparison = a.file_extension.localeCompare(b.file_extension);
        break;
    }

    return order === "desc" ? -comparison : comparison;
  });

  return sorted;
};

export const searchFiles = (files: MyFile[], query: string): MyFile[] => {
  if (!query.trim()) return files;

  const searchTerm = query.toLowerCase().trim();
  return files.filter(
    (file) =>
      file.file_name.toLowerCase().includes(searchTerm) ||
      file.file_extension.toLowerCase().includes(searchTerm) ||
      file.category.toLowerCase().includes(searchTerm),
  );
};

export const groupFilesByCategory = (
  files: MyFile[],
): Record<FileCategory, MyFile[]> => {
  const groups: Record<FileCategory, MyFile[]> = {
    image: [],
    video: [],
    audio: [],
    document: [],
    apk: [],
    zip: [],
  };

  files.forEach((file) => {
    const category = file.category;
    if (groups[category]) {
      groups[category].push(file);
    }
  });

  return groups;
};

export const getFileCategoryStats = (files: MyFile[]) => {
  const stats = {
    all: { count: files.length, size: 0 },
    image: { count: 0, size: 0 },
    video: { count: 0, size: 0 },
    audio: { count: 0, size: 0 },
    document: { count: 0, size: 0 },
    apk: { count: 0, size: 0 },
    zip: { count: 0, size: 0 },
  };

  files.forEach((file) => {
    stats.all.size += file.file_size;

    const category = file.category;
    if (stats[category as keyof typeof stats]) {
      stats[category as keyof typeof stats].count += 1;
      stats[category as keyof typeof stats].size += file.file_size;
    }
  });

  return stats;
};

export const getThumbnailUrl = (file: MyFile): string => {
  if (!isImageFile(file)) return "";

  return file.file;
};

export const canPreviewInBrowser = (file: MyFile): boolean => {
  const previewableMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",

    "video/mp4",
    "video/webm",
    "video/ogg",

    "text/plain",
    "text/html",
    "text/css",
    "text/javascript",

    "application/json",

    "application/pdf",
  ];

  return previewableMimeTypes.includes(file.mime_type.toLowerCase());
};

export const formatFileDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const buildMyFilesQueryParams = (
  params: Partial<GetMyFilesParams>,
): Record<string, any> => {
  return buildQueryParams(params);
};
