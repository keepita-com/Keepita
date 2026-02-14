import React from "react";
import { Download } from "lucide-react";
import GenericBrowserList from "./GenericBrowserList";
import DownloadItemComponent from "./DownloadItemComponent";
import type { DownloadItem } from "../types/browser.types";

interface DownloadsViewProps {
  downloads: DownloadItem[];
  searchQuery: string;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  theme = "Samsung",
}) => {
  const downloadsTheme = {
    Samsung: {
      theme: "Samsung" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-gray-300 mb-4",
    },
    Xiaomi: {
      theme: "Xiaomi" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-gray-300 mb-4",
    },
    Apple: {
      theme: "Apple" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-gray-400 mb-4",
    },
  };
  const currentTheme = downloadsTheme[theme];
  return (
    <GenericBrowserList
      items={downloads}
      searchQuery={searchQuery}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={(downloadItem, _index, query) => (
        <DownloadItemComponent
          key={downloadItem.id}
          downloadItem={downloadItem}
          searchQuery={query}
          theme={currentTheme.theme}
        />
      )}
      emptyState={{
        icon: <Download className={currentTheme.emptyIconClassNames} />,
        title: "No Downloads Found",
        description: "This backup doesn't contain any downloads.",
      }}
      loadingText="Loading more downloads..."
      endText="No more downloads to load"
      theme={currentTheme.theme}
    />
  );
};

export default DownloadsView;
