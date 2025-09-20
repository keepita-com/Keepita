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
}

const SearchesView: React.FC<SearchesViewProps> = ({
  searches,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
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
        />
      )}
      emptyState={{
        icon: <Search className="w-16 h-16 text-gray-300 mb-4" />,
        title: "No Search Queries Found",
        description: "This backup doesn't contain any search history.",
      }}
      loadingText="Loading more searches..."
      endText="No more searches to load"
    />
  );
};

export default SearchesView;
