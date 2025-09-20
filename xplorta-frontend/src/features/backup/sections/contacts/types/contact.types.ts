// Contact domain types following SOLID principles
import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export interface Contact {
  id: number;
  backup: number;
  name: string;
  profile_image: string | null;
  phone_number: string;
  date_of_birth: string | null;
  is_favorite: boolean;
  has_image?: boolean; // Backend field for filtering
}

// API response structure
export interface ContactsResponse extends ApiResponseList<Contact[]> {}

// API request parameters
export interface GetContactsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_favorite?: boolean;
  has_image?: boolean;
}

// Contact filtering options
export interface ContactFilters {
  search?: string;
  is_favorite?: boolean;
  has_image?: boolean;
}

// Contact sorting configuration
export interface ContactSortConfig {
  field: "name" | "is_favorite";
  direction: "asc" | "desc";
}

// Contact sort options based on backend ordering_fields
export interface ContactSortOption {
  value: string;
  label: string;
  field: "name" | "is_favorite";
  direction: "asc" | "desc";
}

// Contact list grouping
export interface GroupedContacts {
  [letter: string]: Contact[];
}

// Contact actions
export interface ContactActions {
  onCall?: (contact: Contact) => void;
  onMessage?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onToggleFavorite?: (contact: Contact) => void;
}

// Contact list props
export interface ContactListProps {
  contacts: Contact[];
  actions?: ContactActions;
  isLoading?: boolean;
}

// Contact search and filter props
export interface ContactSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: ContactFilters;
  onFiltersChange?: (filters: ContactFilters) => void;
}

// Contact stats
export interface ContactStats {
  total: number;
  favorites: number;
  withPhotos: number;
  withBirthdays: number;
}
