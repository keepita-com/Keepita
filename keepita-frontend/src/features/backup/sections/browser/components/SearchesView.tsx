import React from "react";
import { Search } from "lucide-react";
import GenericBrowserList from "./GenericBrowserList";
import SearchItem from "./SearchItem";
import type { SearchQuery } from "../types/browser.types";

interface SearchesViewProps {
  searches: SearchQuery[];
  searchQuery: string;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const SearchesView: React.FC<SearchesViewProps> = ({
  searches,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  theme = "Samsung",
}) => {
  const searchesTheme = {
    Samsung: {
      emptyIconClassNames: "w-16 h-16 text-gray-300 mb-4",
      theme: "Samsung" as "Samsung" | "Xiaomi" | "Apple",
    },
    Xiaomi: {
      emptyIconClassNames: "w-16 h-16 text-stone-700 mb-4",
      theme: "Xiaomi" as "Samsung" | "Xiaomi" | "Apple",
    },
    Apple: {
      emptyIconClassNames: "w-16 h-16 text-gray-400 mb-4",
      theme: "Apple" as "Samsung" | "Xiaomi" | "Apple",
    },
  };
  const currentTheme = searchesTheme[theme];

  return (
    <GenericBrowserList
      items={searches}
      searchQuery={searchQuery}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={(search, _index, query) => (
        <SearchItem
          key={search.id}
          searchQuery={search}
          highlightQuery={query}
          theme={currentTheme.theme}
        />
      )}
      emptyState={{
        icon: <Search className={currentTheme.emptyIconClassNames} />,
        title: "No Search Queries Found",
        description: "This backup doesn't contain any search history.",
      }}
      loadingText="Loading more searches..."
      endText="No more searches to load"
      theme={currentTheme.theme}
    />
  );
};

export default SearchesView;
