import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Contact,
  ContactFilters,
  ContactSortConfig,
} from "../types/contact.types";

/**
 * Contact store interface - Only client-side state
 */
interface ContactStore {
  // Client-side state only
  selectedContact: Contact | null;
  searchQuery: string;
  filters: ContactFilters;
  sortConfig: ContactSortConfig;

  // Actions - Only client-side actions
  selectContact: (contact: Contact | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: ContactFilters) => void;
  setSortConfig: (sortConfig: ContactSortConfig) => void;
  clearFilters: () => void;
  reset: () => void;
}

/**
 * Initial state - Only client-side state
 */
const initialState = {
  selectedContact: null,
  searchQuery: "",
  filters: {},
  sortConfig: {
    field: "name" as const,
    direction: "asc" as const,
  },
};

/**
 * Contact store implementation - Only client-side state management
 */
export const useContactStore = create<ContactStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // Contact selection (client-side only)
      selectContact: (selectedContact) =>
        set({ selectedContact }, false, "selectContact"),

      // Search and filters (client-side only)
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
          "clearFilters"
        ),

      reset: () => set(initialState, false, "reset"),
    }),
    {
      name: "contact-store",
    }
  )
);
