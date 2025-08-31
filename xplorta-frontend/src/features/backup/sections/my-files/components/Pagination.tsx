import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyFilesStore } from "../store/myFiles.store";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  totalResults: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange?: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  totalResults,
  hasNext,
  hasPrevious,
  onPageChange,
}) => {
  const { currentPage, setCurrentPage } = useMyFilesStore();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      onPageChange?.(page);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4"
    >
      {/* Results Info */}
      <div className="flex justify-center">
        <span className="text-gray-600 text-sm">
          Showing {Math.min((currentPage - 1) * 20 + 1, totalResults)}-
          {Math.min(currentPage * 20, totalResults)} of {totalResults} files
        </span>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden md:flex justify-center items-center gap-2">
        {/* Previous Button */}
        <motion.button
          whileHover={hasPrevious ? { scale: 1.05 } : {}}
          whileTap={hasPrevious ? { scale: 0.95 } : {}}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
            hasPrevious
              ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          <AnimatePresence mode="wait">
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center w-9 h-9 text-gray-400 text-sm"
                  >
                    •••
                  </motion.span>
                ) : (
                  <motion.button
                    key={page}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(page as number)}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? "bg-blue-500 text-white shadow-md border-blue-500"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </motion.button>
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={hasNext ? { scale: 1.05 } : {}}
          whileTap={hasNext ? { scale: 0.95 } : {}}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
            hasNext
              ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
          title="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Mobile Pagination */}
      <div className="flex md:hidden justify-center items-center gap-3">
        <motion.button
          whileHover={hasPrevious ? { scale: 1.05 } : {}}
          whileTap={hasPrevious ? { scale: 0.95 } : {}}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`flex items-center justify-center w-10 h-10 border rounded-xl text-base transition-colors ${
            hasPrevious
              ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <span className="text-gray-900 text-sm font-medium min-w-[60px] text-center">
          {currentPage} of {totalPages}
        </span>

        <motion.button
          whileHover={hasNext ? { scale: 1.05 } : {}}
          whileTap={hasNext ? { scale: 0.95 } : {}}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`flex items-center justify-center w-10 h-10 border rounded-xl text-base transition-colors ${
            hasNext
              ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Pagination;
