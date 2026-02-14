import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Contact,
  ContactFilters,
  ContactSortConfig,
} from "../types/contact.types";

interface ContactStore {
  selectedContact: Contact | null;
  searchQuery: string;
  filters: ContactFilters;
  sortConfig: ContactSortConfig;

  selectContact: (contact: Contact | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: ContactFilters) => void;
  setSortConfig: (sortConfig: ContactSortConfig) => void;
  clearFilters: () => void;
  reset: () => void;
}

const initialState = {
  selectedContact: null,
  searchQuery: "",
  filters: {},
  sortConfig: {
    field: "name" as const,
    direction: "asc" as const,
  },
};

export const useContactStore = create<ContactStore>()(
  devtools(
    (set) => ({
      ...initialState,

      selectContact: (selectedContact) =>
        set({ selectedContact }, false, "selectContact"),

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }, false, "setSearchQuery"),

      setFilters: (filters) => set({ filters }, false, "setFilters"),

      setSortConfig: (sortConfig) =>
        set({ sortConfig }, false, "setSortConfig"),

      clearFilters: () =>
        set(
          {
            filters: {},
            searchQuery: "",
          },
          false,
          "clearFilters",
        ),

      reset: () => set(initialState, false, "reset"),
    }),
    {
      name: "contact-store",
    },
  ),
);
