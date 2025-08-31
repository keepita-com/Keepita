import React from "react";
import { History } from "lucide-react";
import GenericBrowserList from "./GenericBrowserList";
import HistoryItem from "./HistoryItem";
import type { HistoryEntry } from "../types/browser.types";

interface HistoryViewProps {
  history: HistoryEntry[];
  searchQuery: string;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
  return (
    <GenericBrowserList
      items={history}
      searchQuery={searchQuery}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={(historyEntry, _index, query) => (
        <HistoryItem
          key={historyEntry.id}
          historyEntry={historyEntry}
          searchQuery={query}
        />
      )}
      emptyState={{
        icon: <History className="w-16 h-16 text-gray-300 mb-4" />,
        title: "No History Found",
        description: "This backup doesn't contain any browsing history.",
      }}
      loadingText="Loading more history..."
      endText="No more history to load"
    />
  );
};

export default HistoryView;
