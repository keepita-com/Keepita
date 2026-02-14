import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export interface Contact {
  id: number;
  backup: number;
  name: string;
  profile_image: string | null;
  phone_number: string;
  date_of_birth: string | null;
  is_favorite: boolean;
  has_image?: boolean;
}

export interface ContactsResponse extends ApiResponseList<Contact[]> {}

export interface GetContactsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_favorite?: boolean;
  has_image?: boolean;
}

export interface ContactFilters {
  search?: string;
  is_favorite?: boolean;
  has_image?: boolean;
  [key: string]: boolean | string | undefined;
}

export interface ContactSortConfig {
  field: "name" | "is_favorite";
  direction: "asc" | "desc";
}

export interface ContactSortOption {
  value: string;
  label: string;
  field: "name" | "is_favorite";
  direction: "asc" | "desc";
}

export interface GroupedContacts {
  [letter: string]: Contact[];
}

export interface ContactActions {
  onCall?: (contact: Contact) => void;
  onMessage?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onToggleFavorite?: (contact: Contact) => void;
}

export interface ContactListProps {
  contacts: Contact[];
  actions?: ContactActions;
  isLoading?: boolean;
}

export interface ContactSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: ContactFilters;
  onFiltersChange?: (filters: ContactFilters) => void;
}

export interface ContactStats {
  total: number;
  favorites: number;
  withPhotos: number;
  withBirthdays: number;
}
