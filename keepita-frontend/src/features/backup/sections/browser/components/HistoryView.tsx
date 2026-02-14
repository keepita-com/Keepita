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
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  theme = "Samsung",
}) => {
  const historyTheme = {
    Samsung: {
      theme: "Samsung" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-gray-300 mb-4",
    },
    Xiaomi: {
      theme: "Xiaomi" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-14 h-14 text-stone-700 mb-4",
    },
    Apple: {
      theme: "Apple" as "Samsung" | "Xiaomi" | "Apple",
      emptyIconClassNames: "w-16 h-16 text-gray-400 mb-4",
    },
  };

  const currentTheme = historyTheme[theme];
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
          theme={currentTheme.theme}
        />
      )}
      emptyState={{
        icon: <History className={currentTheme.emptyIconClassNames} />,
        title: "No History Found",
        description: "This backup doesn't contain any browsing history.",
      }}
      loadingText="Loading more history..."
      endText="No more history to load"
      theme={currentTheme.theme}
    />
  );
};

export default HistoryView;
