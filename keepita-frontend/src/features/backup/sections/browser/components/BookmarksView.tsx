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
}

const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
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
        />
      )}
      emptyState={{
        icon: <Bookmark className="w-16 h-16 text-gray-300 mb-4" />,
        title: "No Bookmarks Found",
        description: "This backup doesn't contain any bookmarks.",
      }}
      loadingText="Loading more bookmarks..."
      endText="No more bookmarks to load"
    />
  );
};

export default BookmarksView;
