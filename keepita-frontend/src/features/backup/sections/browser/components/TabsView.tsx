import React from "react";
import { Globe } from "lucide-react";
import GenericBrowserList from "./GenericBrowserList";
import TabItem from "./TabItem";
import type { BrowserTab } from "../types/browser.types";

interface TabsViewProps {
  tabs: BrowserTab[];
  searchQuery: string;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const TabsView: React.FC<TabsViewProps> = ({
  tabs,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  theme = "Samsung",
}) => {
  const tabsThems = {
    Samsung: {
      theme: "Samsung" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-gray-300 mb-4",
    },
    Xiaomi: {
      theme: "Xiaomi" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-stone-700 mb-4",
    },
    Apple: {
      theme: "Apple" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-gray-400 mb-4",
    },
  };
  const currentTheme = tabsThems[theme];

  return (
    <GenericBrowserList
      items={tabs}
      searchQuery={searchQuery}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={(tab, _index, query) => (
        <TabItem
          key={tab.id}
          tab={tab}
          searchQuery={query}
          theme={currentTheme.theme}
        />
      )}
      emptyState={{
        icon: <Globe className={currentTheme.emptyIconClassNames} />,
        title: "No Tabs Found",
        description: "This backup doesn't contain any browser tabs.",
      }}
      loadingText="Loading more tabs..."
      endText="No more tabs to load"
      theme={currentTheme.theme}
    />
  );
};

export default TabsView;
