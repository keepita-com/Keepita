import React from "react";
import { MessageThreadItem } from "./MessageThreadItem";
import type { MessageThread } from "../types/message.types";
import { samsungColors } from "../../../constants/samsung.constants";
import { Loader2, MessageSquare } from "lucide-react";
import { useInfiniteScroll } from "../hooks/message.hooks";

interface MessageListProps {
  threads: MessageThread[];
  loading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onThreadSelect?: (thread: MessageThread) => void;
  selectedThreadId?: number;
  emptyMessage?: string;
  searchQuery?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  threads,
  loading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onThreadSelect,
  selectedThreadId,
  emptyMessage = "No messages found",
  searchQuery = "",
}) => {
  // Use improved infinite scroll hook
  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: hasMore,
    fetchNextPage: onLoadMore || (() => {}),
    isFetchingNextPage: isLoadingMore,
    threshold: 0.1,
    rootMargin: "50px",
  });

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4 rounded-lg animate-pulse"
          style={{ backgroundColor: samsungColors.background.secondary }}
        >
          <div
            className="w-12 h-12 rounded-full"
            style={{ backgroundColor: samsungColors.border.light }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 rounded w-1/3"
              style={{ backgroundColor: samsungColors.border.light }}
            />
            <div
              className="h-3 rounded w-2/3"
              style={{ backgroundColor: samsungColors.border.light }}
            />
          </div>
          <div
            className="w-8 h-3 rounded"
            style={{ backgroundColor: samsungColors.border.light }}
          />
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div
      className="flex flex-col items-center justify-center h-full p-8 text-center"
      style={{ backgroundColor: samsungColors.background.primary }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: samsungColors.border.light }}
      >
        <MessageSquare
          size={32}
          style={{ color: samsungColors.text.secondary }}
        />
      </div>
      <h3
        className="text-lg font-medium mb-2"
        style={{ color: samsungColors.text.primary }}
      >
        {emptyMessage}
      </h3>
      <p
        className="text-sm max-w-sm"
        style={{ color: samsungColors.text.secondary }}
      >
        Your message conversations will appear here when they're available.
      </p>
    </div>
  );

  if (loading && threads.length === 0) {
    return <LoadingSkeleton />;
  }

  if (!loading && threads.length === 0) {
    return <EmptyState />;
  }
  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: samsungColors.background.primary }}
    >
      <div className="p-2">
        {" "}
        {threads.map((thread) => (
          <MessageThreadItem
            key={thread.id}
            thread={thread}
            isSelected={selectedThreadId === thread.id}
            onClick={() => onThreadSelect?.(thread)}
            searchQuery={searchQuery}
          />
        ))}
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: samsungColors.primary[500] }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: samsungColors.text.secondary }}
            >
              Loading more messages...
            </span>
          </div>
        )}
        {/* Intersection observer sentinel */}
        {hasMore && !isLoadingMore && (
          <div
            ref={loadMoreRef}
            className="h-4 flex items-center justify-center"
          >
            <div className="text-xs text-gray-400">Scroll to load more</div>
          </div>
        )}
        {/* End of list indicator */}
        {!hasMore && threads.length > 0 && (
          <div className="text-center py-4">
            <p
              className="text-xs"
              style={{ color: samsungColors.text.secondary }}
            >
              No more messages to load
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
