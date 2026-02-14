import React, { type ReactNode, memo } from "react";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import { APP_SORT_OPTIONS } from "../constants/app.constants";
import MobileSearchAndFilterHeader from "@/shared/components/MobileSearchAndFilterHeader";
import XiaomiSectionLayout from "@/shared/components/XiaomiSectionLayout";
import AppleSectionLayout from "@/shared/components/AppleSectionLayout";

type Theme = "Samsung" | "Xiaomi" | "Apple";

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
  theme?: Theme;
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
    theme = "Samsung",
  }) => {
    const renderLayout = {
      Samsung: {
        layout: SamsungSectionLayout,
        theme: "Samsung",
        searchPlaceholder: "Search apps...",
        mainContentWrraperClassNames:
          "flex-1 overflow-y-auto px-4 pb-4 bg-white",
      },
      Xiaomi: {
        layout: XiaomiSectionLayout,
        theme: "Xiaomi",
        searchPlaceholder: "Search for apps",
        mainContentWrraperClassNames:
          "flex-1 overflow-y-auto px-4 pb-4 bg-gray-50",
      },
      Apple: {
        layout: AppleSectionLayout,
        theme: "Apple",
        searchPlaceholder: "Search apps...",
        mainContentWrraperClassNames: "flex-1 overflow-y-auto px-2 pb-4",
      },
    };
    const currentLayout = renderLayout[theme];

    const currentSortConfig = {
      field: sortBy,
      direction: sortOrder,
    };

    const handleSortChange = (config: {
      field: string;
      direction: "asc" | "desc";
    }) => {
      onSortChange(config.field, config.direction);
    };

    return (
      <>
        <currentLayout.layout
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          showBackButton={true}
          bgColor={theme === "Apple" ? "bg-white" : "bg-gray-50"}
        >
          <MobileSearchAndFilterHeader
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchPlaceholder={currentLayout.searchPlaceholder}
            sortConfig={currentSortConfig}
            onSortChange={handleSortChange}
            sortOptions={APP_SORT_OPTIONS}
            resultsCount={totalApps}
            resultsLabel="apps"
            theme={currentLayout.theme as "Samsung" | "Xiaomi" | "Apple"}
            classOverrides={
              theme === "Xiaomi"
                ? {
                    containerClass:
                      "bg-gray-50 rounded-2xl w-full mx-auto pt-2 pb-2 mb-2  ",
                    inputClass:
                      "w-full pl-13 pr-10 py-3 border text-stone-900 font-semibold border-gray-200 rounded-xl text-sm sm:text-md bg-gray-100  focus:border-gray-200 focus:outline-none transition-all duration-200",
                    sortButtonClass:
                      "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 text-stone-700 hover:bg-gray-200 border border-gray-200 ",
                  }
                : theme === "Apple"
                  ? {
                      containerClass: "bg-[#F5F5F5] rounded-2xl pb-2 mb-2 mx-4",
                      inputClass:
                        "w-full pl-13 pr-10 py-3 text-gray-900 font-semibold rounded-xl text-sm sm:text-md bg-[#E9E9EA] focus:border-blue-300 transition-all duration-300",
                      sortButtonClass:
                        "flex items-center gap-2 px-4 py-3 rounded-xl text-md font-medium text-white  ",
                    }
                  : {}
            }
          />

          <div className={currentLayout.mainContentWrraperClassNames}>
            {children}
          </div>
        </currentLayout.layout>
      </>
    );
  },
);

AppListLayout.displayName = "SamsungAppListLayout";

export default AppListLayout;
