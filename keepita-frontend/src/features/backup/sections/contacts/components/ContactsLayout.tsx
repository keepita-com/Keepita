import React from "react";
import { SamsungSectionLayout } from "../../../../../shared/components";
import {
  CONTACT_SORT_OPTIONS,
  CONTACT_FILTER_OPTIONS,
} from "../constants/contact.constants";
import type { ContactFilters, ContactSortConfig } from "../types/contact.types";
import { Heart, Camera } from "lucide-react";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";
import type { JSX } from "react/jsx-runtime";
import XiaomiSectionLayout from "@/shared/components/XiaomiSectionLayout";
import AppleSectionLayout from "@/shared/components/AppleSectionLayout";
import MobileSearchAndFilterHeader from "@/shared/components/MobileSearchAndFilterHeader";

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
  const { theme } = useBackupTheme();

  const filterOptions = CONTACT_FILTER_OPTIONS.map((option) => ({
    key: option.key,
    label: option.label,
    icon: option.icon === "heart" ? Heart : Camera,
    color: option.icon === "heart" ? "text-red-500" : "text-blue-500",
  }));

  const sortOptions = CONTACT_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    field: option.field,
    direction: option.direction,
  }));

  const handleSortChange = (config: {
    field: string;
    direction: "asc" | "desc";
  }) => {
    onSortChange({
      field: config.field as "name" | "is_favorite",
      direction: config.direction,
    });
  };

  const booleanFilters: Record<string, boolean | undefined> = {
    is_favorite: filters.is_favorite,
    has_image: filters.has_image,
  };

  const sectionLayout: Record<string, JSX.Element> = {
    Samsung: (
      <SamsungSectionLayout
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        isLoading={isLoading}
      >
        <MobileSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search contacts..."
          filters={booleanFilters}
          onFiltersChange={(newFilters) =>
            onFiltersChange({ ...filters, ...newFilters })
          }
          filterOptions={filterOptions}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          resultsCount={resultsCount}
          theme="Samsung"
        />
        <div className="flex-1">{children}</div>
      </SamsungSectionLayout>
    ),
    Xiaomi: (
      <XiaomiSectionLayout
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        isLoading={isLoading}
      >
        <MobileSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search contacts..."
          filters={booleanFilters}
          onFiltersChange={(newFilters) =>
            onFiltersChange({ ...filters, ...newFilters })
          }
          filterOptions={filterOptions}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          resultsCount={resultsCount}
          theme="Xiaomi"
        />
        <div className="flex-1">{children}</div>
      </XiaomiSectionLayout>
    ),
    Apple: (
      <AppleSectionLayout
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        isLoading={isLoading}
      >
        <MobileSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search contacts..."
          filters={booleanFilters}
          onFiltersChange={(newFilters) =>
            onFiltersChange({ ...filters, ...newFilters })
          }
          filterOptions={filterOptions}
          sortConfig={sortConfig}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          resultsCount={resultsCount}
          theme="Apple"
        />
        <div className="flex-1">{children}</div>
      </AppleSectionLayout>
    ),
  };

  return sectionLayout[theme];
};

export default ContactsLayout;
