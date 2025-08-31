import React, { type ReactNode, memo } from "react";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import SamsungSearchAndFilterHeader from "../../../../../shared/components/SamsungSearchAndFilterHeader";
import { APP_SORT_OPTIONS } from "../constants/app.constants";

interface AppListLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  totalApps?: number;
}

const AppListLayout: React.FC<AppListLayoutProps> = memo(
  ({
    children,
    title = "Apps",
    subtitle,
    searchQuery,
    onSearchChange,
    onBack,
    sortBy,
    sortOrder,
    onSortChange,
    totalApps = 0,
  }) => {
    // Current sort configuration for Samsung component
    const currentSortConfig = {
      field: sortBy,
      direction: sortOrder,
    };

    // Handle sort change from Samsung component
    const handleSortChange = (config: {
      field: string;
      direction: "asc" | "desc";
    }) => {
      onSortChange(config.field, config.direction);
    };

    return (
      <SamsungSectionLayout
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        showBackButton={true}
      >
        <SamsungSearchAndFilterHeader
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search apps..."
          sortConfig={currentSortConfig}
          onSortChange={handleSortChange}
          sortOptions={APP_SORT_OPTIONS}
          resultsCount={totalApps}
          resultsLabel="apps"
        />

        {/* App Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </SamsungSectionLayout>
    );
  }
);

AppListLayout.displayName = "SamsungAppListLayout";

export default AppListLayout;
