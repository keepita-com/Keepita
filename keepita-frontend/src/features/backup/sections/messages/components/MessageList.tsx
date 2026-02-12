import React from "react";
import { MessageThreadItem } from "./MessageThreadItem";
import type { MessageThread } from "../types/message.types";
import { Loader2, MessageSquare } from "lucide-react";
import { useInfiniteScroll } from "../hooks/message.hooks";
import { samsungColors } from "../../../constants/samsung.constants";
import { xiaomiColors } from "@/features/backup/constants/xiaomi.constants";

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
  theme?: "Samsung" | "Xiaomi" | "Apple";
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
  theme = "Samsung",
}) => {
  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: hasMore,
    fetchNextPage: onLoadMore || (() => {}),
    isFetchingNextPage: isLoadingMore,
    threshold: 0.1,
    rootMargin: "50px",
  });

  const themeConfig = {
    Samsung: {
      bg: samsungColors.background.primary,
      itemBg: samsungColors.background.secondary,
      border: samsungColors.border.light,
      textPrimary: samsungColors.text.primary,
      textSecondary: samsungColors.text.secondary,
      loaderColor: samsungColors.primary[500],
      emptyIconColor: samsungColors.text.secondary,
      listWrapperClass: "p-2",
    },
    Xiaomi: {
      bg: xiaomiColors.background.main,
      itemBg: "#fff",
      border: "#e5e5e5",
      textPrimary: "#111827",
      textSecondary: "#6b7280",
      loaderColor: "red",
      emptyIconColor: "text-stone-700",
      listWrapperClass: "px-0 py-2 bg-gray-100 rounded-3xl overflow-hidden",
    },
    Apple: {
      bg: "#ffff",
      itemBg: "#fff",
      border: "#c6c6c8",
      textPrimary: "#1c1c1e",
      textSecondary: "#8e8e93",
      loaderColor: "#007aff",
      emptyIconColor: "#8e8e93",
      listWrapperClass: "p-2",
    },
  };

  const currentTheme = themeConfig[theme || "Samsung"];

  const LoadingSkeleton = () => (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-4 rounded-lg animate-pulse"
          style={{ backgroundColor: currentTheme.itemBg }}
        >
          <div
            className="w-12 h-12 rounded-full"
            style={{ backgroundColor: currentTheme.border }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 rounded w-1/3"
              style={{ backgroundColor: currentTheme.border }}
            />
            <div
              className="h-3 rounded w-2/3"
              style={{ backgroundColor: currentTheme.border }}
            />
          </div>
          <div
            className="w-8 h-3 rounded"
            style={{ backgroundColor: currentTheme.border }}
          />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div
      className="flex flex-col items-center justify-center h-full p-8 text-center"
      style={{ backgroundColor: currentTheme.bg }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: currentTheme.border }}
      >
        <MessageSquare
          size={32}
          style={{
            color:
              theme === "Samsung" ? currentTheme.emptyIconColor : undefined,
          }}
          className={theme === "Xiaomi" ? currentTheme.emptyIconColor : ""}
        />
      </div>
      <h3
        className="text-lg font-medium mb-2"
        style={{ color: currentTheme.textPrimary }}
      >
        {emptyMessage}
      </h3>
      <p
        className="text-sm max-w-sm"
        style={{ color: currentTheme.textSecondary }}
      >
        Your message conversations will appear here when they're available.
      </p>
    </div>
  );

  if (loading && threads.length === 0) return <LoadingSkeleton />;
  if (!loading && threads.length === 0) return <EmptyState />;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: currentTheme.bg }}
    >
      <div className={currentTheme.listWrapperClass}>
        {threads.map((thread) => (
          <MessageThreadItem
            key={thread.id}
            thread={thread}
            isSelected={selectedThreadId === thread.id}
            onClick={() => onThreadSelect?.(thread)}
            searchQuery={searchQuery}
            theme={theme || "Samsung"}
          />
        ))}

        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: currentTheme.loaderColor }}
            />
            <span
              className="ml-2 text-sm"
              style={{ color: currentTheme.textSecondary }}
            >
              Loading more messages...
            </span>
          </div>
        )}

        {hasMore && !isLoadingMore && (
          <div
            ref={loadMoreRef}
            className="h-4 flex items-center justify-center"
          >
            <div className="text-xs text-gray-400">Scroll to load more</div>
          </div>
        )}

        {!hasMore && threads.length > 0 && (
          <div className="text-center py-4">
            <p
              className="text-xs"
              style={{ color: currentTheme.textSecondary }}
            >
              No more messages to load
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
