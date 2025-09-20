import { useState, useCallback } from "react";

/**
 * A simple pagination hook that manages page state and provides navigation methods
 * @param initialPage - The initial page number
 * @param initialPageSize - The initial page size
 */
export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
    }
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback((totalPages: number) => {
    if (totalPages > 0) {
      setPage(totalPages);
    }
  }, []);

  // Method to reset pagination to first page (useful for filters/search)
  const resetToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  // Calculate visible range based on external pagination data
  const getVisibleRange = useCallback(
    (currentPage: number, currentPageSize: number, totalResults: number) => {
      if (!totalResults) return { start: 0, end: 0 };

      const start = (currentPage - 1) * currentPageSize + 1;
      const end = Math.min(currentPage * currentPageSize, totalResults);

      return { start, end };
    },
    []
  );

  return {
    // Current state
    page,
    pageSize,

    // Navigation methods
    handlePageChange,
    handlePageSizeChange,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    resetToFirstPage,

    // Utility methods
    getVisibleRange,
  };
}
