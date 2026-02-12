import { useState, useCallback } from "react";

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
    setPage(1);
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

  const resetToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const getVisibleRange = useCallback(
    (currentPage: number, currentPageSize: number, totalResults: number) => {
      if (!totalResults) return { start: 0, end: 0 };

      const start = (currentPage - 1) * currentPageSize + 1;
      const end = Math.min(currentPage * currentPageSize, totalResults);

      return { start, end };
    },
    [],
  );

  return {
    page,
    pageSize,

    handlePageChange,
    handlePageSizeChange,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    resetToFirstPage,

    getVisibleRange,
  };
}
