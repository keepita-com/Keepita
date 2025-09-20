import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface BackupPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading?: boolean;
}

const BackupPagination: React.FC<BackupPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevPage,
  onNextPage,
  hasNextPage,
  hasPrevPage,
  isLoading = false,
}) => {
  const buttonAnimation = {
    hover: {
      scale: 1.05,
      boxShadow: "0 0 10px rgba(255, 255, 255, 0.15)",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  };
  // Check if we're on mobile viewport
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  // Update mobile status on window resize
  React.useEffect(() => {
    const updateWindowSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Set initial value
    updateWindowSize();

    // Add event listener
    window.addEventListener("resize", updateWindowSize);

    // Cleanup
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if less than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      // On mobile, just show first, current, and last with ellipses
      if (isMobile) {
        // Add ellipsis after first page if current page is not 2
        if (currentPage > 2) {
          pageNumbers.push(-1); // -1 represents ellipsis
        }

        // Add current page if it's not first or last
        if (currentPage !== 1 && currentPage !== totalPages) {
          pageNumbers.push(currentPage);
        }

        // Add ellipsis before last page if current page is not one before last
        if (currentPage < totalPages - 1) {
          pageNumbers.push(-2); // -2 represents ellipsis
        }
      } else {
        // Desktop layout
        // Calculate range around current page
        let startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, startPage + 2);

        // Adjust start if end is too close to totalPages
        if (endPage === totalPages - 1) {
          startPage = Math.max(2, endPage - 2);
        }

        // Add ellipsis after first page if needed
        if (startPage > 2) {
          pageNumbers.push(-1); // -1 represents ellipsis
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(i);
        }

        // Add ellipsis before last page if needed
        if (endPage < totalPages - 1) {
          pageNumbers.push(-2); // -2 represents ellipsis
        }
      }

      // Always include last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();
  return (
    <motion.div
      className="flex items-center justify-center flex-wrap gap-2 my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* First Page Button */}
      <motion.button
        whileHover={buttonAnimation.hover}
        whileTap={buttonAnimation.tap}
        disabled={!hasPrevPage || isLoading}
        onClick={() => onPageChange(1)}
        className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-800/50 text-gray-300 border border-gray-700/30 hover:bg-gray-700/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="First page"
      >
        <ChevronsLeft className="w-4 h-4" />
      </motion.button>

      {/* Previous Button */}
      <motion.button
        whileHover={buttonAnimation.hover}
        whileTap={buttonAnimation.tap}
        disabled={!hasPrevPage || isLoading}
        onClick={onPrevPage}
        className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-800/50 text-gray-300 border border-gray-700/30 hover:bg-gray-700/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>

      {/* Page Numbers */}
      <AnimatePresence mode="wait">
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber < 0) {
            // Render ellipsis
            return (
              <motion.span
                key={`ellipsis-${pageNumber}`}
                className="text-gray-400 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { delay: index * 0.05 + 0.1 },
                }}
              >
                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    repeatDelay: 0.5,
                  }}
                >
                  •••
                </motion.span>
              </motion.span>
            );
          }

          const isActive = pageNumber === currentPage;

          return (
            <motion.button
              key={`page-${pageNumber}`}
              whileHover={isActive ? {} : buttonAnimation.hover}
              whileTap={isActive ? {} : buttonAnimation.tap}
              disabled={isLoading}
              onClick={() => onPageChange(pageNumber)}
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-lg shadow-indigo-500/30"
                  : "bg-gray-800/50 text-gray-300 border border-gray-700/30 hover:bg-gray-700/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNumber}
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Next Button */}
      <motion.button
        whileHover={buttonAnimation.hover}
        whileTap={buttonAnimation.tap}
        disabled={!hasNextPage || isLoading}
        onClick={onNextPage}
        className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-800/50 text-gray-300 border border-gray-700/30 hover:bg-gray-700/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>

      {/* Last Page Button */}
      <motion.button
        whileHover={buttonAnimation.hover}
        whileTap={buttonAnimation.tap}
        disabled={!hasNextPage || isLoading}
        onClick={() => onPageChange(totalPages)}
        className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-800/50 text-gray-300 border border-gray-700/30 hover:bg-gray-700/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Last page"
      >
        <ChevronsRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

export default BackupPagination;
