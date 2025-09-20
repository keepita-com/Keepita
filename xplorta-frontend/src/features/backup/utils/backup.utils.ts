import { downloadBlob } from "@/core/utils/downloadBlob";
import type { GetBackupsParams } from "../api/backup.api";
import type { BackupFilters } from "../components/SearchAndFilterBar";
import type { BackupItem } from "../store/backup.store";
import JSZip from "jszip";

export const filterBackups = (
  backups: BackupItem[],
  searchQuery: string
): BackupItem[] => {
  if (!backups || !Array.isArray(backups)) {
    return [];
  }

  return backups.filter((backup) => {
    if (
      searchQuery &&
      !backup.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
};

export const sortBackups = (
  backups: BackupItem[],
  field: string,
  direction: "asc" | "desc"
): BackupItem[] => {
  if (!backups || !Array.isArray(backups)) {
    return [];
  }

  const sortedBackups = [...backups];

  switch (field) {
    case "name":
      return sortedBackups.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return direction === "asc" ? comparison : -comparison;
      });
    case "size":
      return sortedBackups.sort((a, b) => {
        const comparison = a.size - b.size;
        return direction === "asc" ? comparison : -comparison;
      });
    case "date":
      return sortedBackups.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        const comparison = dateA - dateB;
        return direction === "asc" ? comparison : -comparison;
      });
    default:
      return sortedBackups;
  }
};

export const filterAndSortBackups = (
  backups: BackupItem[],
  searchQuery: string,
  sortField: string,
  sortDirection: "asc" | "desc"
): BackupItem[] => {
  const filteredBackups = filterBackups(backups, searchQuery);
  return sortBackups(filteredBackups, sortField, sortDirection);
};

const getDateRange = (customDateFrom?: string, customDateTo?: string) => {
  const result: Record<string, string> = {};

  if (customDateFrom) {
    // For date-only input, add time to start of day
    const fromDate = new Date(customDateFrom + "T00:00:00");
    result.created_after = fromDate.toISOString();
  }
  if (customDateTo) {
    // For date-only input, add time to end of day
    const toDate = new Date(customDateTo + "T23:59:59");
    result.created_before = toDate.toISOString();
  }

  return result;
};

export const buildBackupParams = (
  page: number,
  pageSize: number,
  searchQuery: string,
  filters: BackupFilters,
  sortConfig: { field: string; direction: "asc" | "desc" }
): GetBackupsParams => {
  const params: GetBackupsParams = {
    page,
    page_size: pageSize,
  };

  // Add search
  if (searchQuery.trim()) {
    params.search = searchQuery.trim();
  }

  // Add status filter
  if (filters.status) {
    params.status = filters.status;
  }

  // Add date range filter
  const dateRange = getDateRange(filters.customDateFrom, filters.customDateTo);
  Object.assign(params, dateRange);

  // Add ordering
  const orderingPrefix = sortConfig.direction === "desc" ? "-" : "";
  params.ordering = `${orderingPrefix}${sortConfig.field}`;

  return params;
};

export const formatBytes = (bytes: number) => {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return gb.toFixed(2) + " GB";
  const mb = bytes / 1024 ** 2;
  return mb.toFixed(2) + " MB";
};

export const downloadMedias = async (
  files: { blob: Blob | string; name: string }[]
) => {
  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].name);

    return;
  }

  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  downloadBlob(zipBlob, "medias.zip");
};
