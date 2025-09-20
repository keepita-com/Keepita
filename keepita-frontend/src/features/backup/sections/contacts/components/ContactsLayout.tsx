/**
 * ContactsLayout.tsx
 * Contacts-specific layout component using shared Samsung layout
 */
import React from "react";
import {
  SamsungSectionLayout,
  SamsungSearchAndFilterHeader,
} from "../../../../../shared/components";
import {
  CONTACT_SORT_OPTIONS,
  CONTACT_FILTER_OPTIONS,
} from "../constants/contact.constants";
import type { ContactFilters, ContactSortConfig } from "../types/contact.types";
import { Heart, Camera } from "lucide-react";

interface ContactsLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  sortConfig: ContactSortConfig;
  onSortChange: (sortConfig: ContactSortConfig) => void;
  onBack: () => void;
  isLoading?: boolean;
  resultsCount?: number;
}

const ContactsLayout: React.FC<ContactsLayoutProps> = ({
  children,
  title = "Contacts",
  subtitle,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortConfig,
  onSortChange,
  onBack,
  isLoading = false,
  resultsCount,
}) => {
  // Convert contact-specific filter options to generic format
  const filterOptions = CONTACT_FILTER_OPTIONS.map((option) => ({
    key: option.key,
    label: option.label,
    icon: option.icon === "heart" ? Heart : Camera,
    color: option.icon === "heart" ? "text-red-500" : "text-blue-500",
  }));

  // Convert contact-specific sort options to generic format
  const sortOptions = CONTACT_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    field: option.field,
    direction: option.direction,
  }));

  // Handle sort change with type conversion
  const handleSortChange = (config: {
    field: string;
    direction: "asc" | "desc";
  }) => {
    onSortChange({
      field: config.field as "name" | "is_favorite",
      direction: config.direction,
    });
  };

  return (
    <SamsungSectionLayout
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      isLoading={isLoading}
    >
      <div className="mr-12">
        <SamsungSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search contacts..."
          filters={filters}
          onFiltersChange={onFiltersChange}
          filterOptions={filterOptions}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          resultsCount={resultsCount}
        />
      </div>
      <div className="flex-1">{children}</div>
    </SamsungSectionLayout>
  );
};

export default ContactsLayout;
