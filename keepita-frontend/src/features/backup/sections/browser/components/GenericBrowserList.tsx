import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface GenericBrowserListProps<T> {
  items: T[];
  searchQuery: string;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  renderItem: (item: T, index: number, searchQuery: string) => React.ReactNode;
  emptyState: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  loadingText: string;
  endText: string;
}

function GenericBrowserList<T extends { id: number | string }>({
  items,
  searchQuery,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  renderItem,
  emptyState,
  loadingText,
  endText,
}: GenericBrowserListProps<T>) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer using IntersectionObserver
  useEffect(() => {
    if (!hasNextPage || !fetchNextPage) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {emptyState.icon}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyState.title}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {searchQuery
            ? `No items match "${searchQuery}"`
            : emptyState.description}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="space-y-1 p-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
          >
            {renderItem(item, index, searchQuery)}
          </motion.div>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div
          ref={lastItemRef}
          className="flex items-center justify-center py-8"
        >
          {isFetchingNextPage ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-blue-600"
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm">{loadingText}</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-gray-400"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              <span className="text-sm">Scroll to load more</span>
            </motion.div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && items.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-gray-400">{endText}</span>
        </div>
      )}
    </div>
  );
}

export default GenericBrowserList;
