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
  theme?: "Samsung" | "Xiaomi" | "Apple";
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
  theme = "Samsung",
}: GenericBrowserListProps<T>) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);

  const listThemes = {
    Samsung: {
      containerClassNames: "bg-white",
      listClassNames: "space-y-1 p-4",
    },
    Xiaomi: {
      containerClassNames: "bg-red-50",
      listClassNames: "space-y-2 p-3",
    },
    Apple: {
      containerClassNames: "bg-white",
      listClassNames: "space-y-1 p-4",
    },
  };
  const currentTheme = listThemes[theme];

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
      { threshold: 0.1 },
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
    <div className={currentTheme.containerClassNames}>
      <div className={currentTheme.listClassNames}>
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

      {!hasNextPage && items.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-gray-400">{endText}</span>
        </div>
      )}
    </div>
  );
}

export default GenericBrowserList;
