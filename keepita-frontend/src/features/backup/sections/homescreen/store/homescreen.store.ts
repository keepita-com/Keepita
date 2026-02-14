import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  HomescreenFilters,
  HomescreenSortConfig,
} from "../types/homescreen.types";

interface HomescreenStore {
  currentScreen: number;
  isDetailsModalOpen: boolean;
  selectedLayoutId: string | null;

  filters: HomescreenFilters;
  searchQuery: string;
  sortConfig: HomescreenSortConfig;
  currentPage: number;

  setCurrentScreen: (screen: number) => void;
  setSelectedLayoutId: (layoutId: string | null) => void;
  setFilters: (filters: HomescreenFilters) => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (config: HomescreenSortConfig) => void;
  setCurrentPage: (page: number) => void;
  openDetailsModal: () => void;
  closeDetailsModal: () => void;
  clearFilters: () => void;
  reset: () => void;
}

const initialState = {
  currentScreen: 0,
  isDetailsModalOpen: false,
  selectedLayoutId: null,
  filters: {},
  searchQuery: "",
  sortConfig: { field: "created_at" as const, direction: "desc" as const },
  currentPage: 1,
};

export const useHomescreenStore = create<HomescreenStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setCurrentScreen: (screen) =>
        set(
          (state) => ({
            ...state,
            currentScreen: screen,
          }),
          false,
          "setCurrentScreen",
        ),

      setSelectedLayoutId: (layoutId) =>
        set(
          (state) => ({
            ...state,
            selectedLayoutId: layoutId,
            currentScreen: 0,
          }),
          false,
          "setSelectedLayoutId",
        ),

      setFilters: (filters) =>
        set(
          (state) => ({
            ...state,
            filters,
            currentPage: 1,
          }),
          false,
          "setFilters",
        ),

      setSearchQuery: (query) =>
        set(
          (state) => ({
            ...state,
            searchQuery: query,
            currentPage: 1,
          }),
          false,
          "setSearchQuery",
        ),

      setSortConfig: (config) =>
        set(
          (state) => ({
            ...state,
            sortConfig: config,
            currentPage: 1,
          }),
          false,
          "setSortConfig",
        ),

      setCurrentPage: (page) =>
        set(
          (state) => ({
            ...state,
            currentPage: page,
          }),
          false,
          "setCurrentPage",
        ),

      openDetailsModal: () =>
        set(
          (state) => ({
            ...state,
            isDetailsModalOpen: true,
          }),
          false,
          "openDetailsModal",
        ),

      closeDetailsModal: () =>
        set(
          (state) => ({
            ...state,
            isDetailsModalOpen: false,
          }),
          false,
          "closeDetailsModal",
        ),

      clearFilters: () =>
        set(
          (state) => ({
            ...state,
            filters: {},
            searchQuery: "",
            currentPage: 1,
          }),
          false,
          "clearFilters",
        ),

      reset: () =>
        set(
          () => ({
            ...initialState,
          }),
          false,
          "reset",
        ),
    }),
    {
      name: "homescreen-store",
    },
  ),
);
