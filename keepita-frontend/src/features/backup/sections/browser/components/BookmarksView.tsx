import React from "react";
import { Bookmark } from "lucide-react";
import GenericBrowserList from "./GenericBrowserList";
import BookmarkItem from "./BookmarkItem";
import type { Bookmark as BookmarkType } from "../types/browser.types";

interface BookmarksViewProps {
  bookmarks: BookmarkType[];
  searchQuery: string;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  theme = "Samsung",
}) => {
  const bookmarksTheme = {
    Samsung: {
      emptyIconClassNames: "w-16 h-16 text-gray-300 mb-4",
      theme: "Samsung" as "Samsung" | "Xiaomi" | "Apple",
    },
    Xiaomi: {
      emptyIconClassNames: "w-14 h-14 text-stone-700 mb-4",
      theme: "Xiaomi" as "Samsung" | "Xiaomi" | "Apple",
    },
    Apple: {
      emptyIconClassNames: "w-16 h-16 text-gray-400 mb-4",
      theme: "Apple" as "Samsung" | "Xiaomi" | "Apple",
    },
  };
  const currentTheme = bookmarksTheme[theme];

  return (
    <GenericBrowserList
      items={bookmarks}
      searchQuery={searchQuery}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={(bookmark, _index, query) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          searchQuery={query}
          theme={currentTheme.theme as "Samsung" | "Xiaomi" | "Apple"}
        />
      )}
      emptyState={{
        icon: <Bookmark className={currentTheme.emptyIconClassNames} />,
        title: "No Bookmarks Found",
        description: "This backup doesn't contain any bookmarks.",
      }}
      loadingText="Loading more bookmarks..."
      endText="No more bookmarks to load"
      theme={currentTheme.theme as "Samsung" | "Xiaomi" | "Apple"}
    />
  );
};

export default BookmarksView;
