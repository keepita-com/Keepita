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
}

const TabsView: React.FC<TabsViewProps> = ({
  tabs,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
  return (
    <GenericBrowserList
      items={tabs}
      searchQuery={searchQuery}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={(tab, _index, query) => (
        <TabItem key={tab.id} tab={tab} searchQuery={query} />
      )}
      emptyState={{
        icon: <Globe className="w-16 h-16 text-gray-300 mb-4" />,
        title: "No Tabs Found",
        description: "This backup doesn't contain any browser tabs.",
      }}
      loadingText="Loading more tabs..."
      endText="No more tabs to load"
    />
  );
};

export default TabsView;
