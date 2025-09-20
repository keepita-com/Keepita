import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export interface MyFile {
  id: number;
  backup: number;
  file_name: string;
  file: string;
  file_size: number;
  file_size_human: string;
  file_extension: string;
  mime_type: string;
  category: "image" | "video" | "audio" | "document" | "apk" | "zip";
  created_date: string;
  modified_date: string;
}

export interface MyFilesResponse extends ApiResponseList<MyFile[]> {}

export interface MyFilesFilters {
  search?: string;
  file_name?: string;
  file_extension?: string;
  category?: "image" | "video" | "audio" | "document" | "apk" | "zip";
  min_size?: number;
  max_size?: number;
  created_after?: string;
  created_before?: string;
}

export interface MyFilesSortConfig {
  ordering?:
    | "file_name"
    | "-file_name"
    | "file_size"
    | "-file_size"
    | "created_date"
    | "-created_date"
    | "modified_date"
    | "-modified_date";
}

export interface GetMyFilesParams extends MyFilesFilters, MyFilesSortConfig {
  page?: number;
  page_size?: number;
}

export interface FilePreviewData {
  file: MyFile;
  isPreviewOpen: boolean;
}

export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "apk"
  | "zip";

export type FileViewMode = "grid" | "list";

export type FileSortField = "name" | "size" | "date" | "type";
export type FileSortOrder = "asc" | "desc";

export interface FileSortConfig {
  field: FileSortField;
  order: FileSortOrder;
}
