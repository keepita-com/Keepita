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
}

const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
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
        />
      )}
      emptyState={{
        icon: <Download className="w-16 h-16 text-gray-300 mb-4" />,
        title: "No Downloads Found",
        description: "This backup doesn't contain any downloads.",
      }}
      loadingText="Loading more downloads..."
      endText="No more downloads to load"
    />
  );
};

export default DownloadsView;
