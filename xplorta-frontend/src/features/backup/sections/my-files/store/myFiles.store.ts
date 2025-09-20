import { create } from "zustand";
import type {
  FileCategory,
  FileViewMode,
  FileSortConfig,
  MyFilesFilters,
  FilePreviewData,
} from "../types/myFiles.types";

interface MyFilesClientState {
  // Client-side UI State only
  selectedFiles: number[];
  viewMode: FileViewMode;
  selectedCategory: FileCategory | null;
  searchQuery: string;
  filters: MyFilesFilters;
  sortConfig: FileSortConfig;
  currentPage: number;

  // Preview state (client-side)
  previewData: FilePreviewData | null;
}

interface MyFilesClientActions {
  // Selection actions
  selectFile: (fileId: number) => void;
  selectMultipleFiles: (fileIds: number[]) => void;
  deselectFile: (fileId: number) => void;
  clearSelection: () => void;
  toggleSelection: (fileId: number) => void;

  // UI actions
  setViewMode: (mode: FileViewMode) => void;
  setSelectedCategory: (category: FileCategory | null) => void;

  // Search & Filter actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<MyFilesFilters>) => void;
  clearFilters: () => void;
  setSortConfig: (config: FileSortConfig) => void;

  // Pagination actions
  setCurrentPage: (page: number) => void;

  // Preview actions
  openPreview: (file: any) => void;
  closePreview: () => void;

  // Utility actions
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

  // Selection actions
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

  // UI actions
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, currentPage: 1 }),

  // Search & Filter actions
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

  // Pagination actions
  setCurrentPage: (currentPage) => set({ currentPage }),

  // Preview actions
  openPreview: (file) =>
    set({
      previewData: { file, isPreviewOpen: true },
    }),
  closePreview: () => set({ previewData: null }),

  // Utility actions
  reset: () => set(initialState),
}));
