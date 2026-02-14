import { create } from "zustand";
import type {
  FileCategory,
  FileViewMode,
  FileSortConfig,
  MyFilesFilters,
  FilePreviewData,
} from "../types/myFiles.types";

interface MyFilesClientState {
  selectedFiles: number[];
  viewMode: FileViewMode;
  selectedCategory: FileCategory | null;
  searchQuery: string;
  filters: MyFilesFilters;
  sortConfig: FileSortConfig;
  currentPage: number;

  previewData: FilePreviewData | null;
}

interface MyFilesClientActions {
  selectFile: (fileId: number) => void;
  selectMultipleFiles: (fileIds: number[]) => void;
  deselectFile: (fileId: number) => void;
  clearSelection: () => void;
  toggleSelection: (fileId: number) => void;

  setViewMode: (mode: FileViewMode) => void;
  setSelectedCategory: (category: FileCategory | null) => void;

  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<MyFilesFilters>) => void;
  clearFilters: () => void;
  setSortConfig: (config: FileSortConfig) => void;

  setCurrentPage: (page: number) => void;

  openPreview: (file: any) => void;
  closePreview: () => void;

  reset: () => void;
}

const initialState: MyFilesClientState = {
  selectedFiles: [],
  viewMode: "grid",
  selectedCategory: null,
  searchQuery: "",
  filters: {},
  sortConfig: {
    field: "date",
    order: "desc",
  },
  currentPage: 1,
  previewData: null,
};

export const useMyFilesStore = create<
  MyFilesClientState & MyFilesClientActions
>((set) => ({
  ...initialState,

  selectFile: (fileId) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(fileId)
        ? state.selectedFiles.filter((id) => id !== fileId)
        : [...state.selectedFiles, fileId],
    })),

  toggleSelection: (fileId) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(fileId)
        ? state.selectedFiles.filter((id) => id !== fileId)
        : [...state.selectedFiles, fileId],
    })),

  selectMultipleFiles: (fileIds) => set({ selectedFiles: fileIds }),

  deselectFile: (fileId) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
    })),

  clearSelection: () => set({ selectedFiles: [] }),

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, currentPage: 1 }),

  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1,
    })),
  clearFilters: () =>
    set({
      filters: {},
      searchQuery: "",
      selectedCategory: null,
      currentPage: 1,
    }),
  setSortConfig: (sortConfig) => set({ sortConfig, currentPage: 1 }),

  setCurrentPage: (currentPage) => set({ currentPage }),

  openPreview: (file) =>
    set({
      previewData: { file, isPreviewOpen: true },
    }),
  closePreview: () => set({ previewData: null }),

  reset: () => set(initialState),
}));
