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

  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const updateWindowSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    updateWindowSize();

    window.addEventListener("resize", updateWindowSize);

    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      if (isMobile) {
        if (currentPage > 2) {
          pageNumbers.push(-1);
        }

        if (currentPage !== 1 && currentPage !== totalPages) {
          pageNumbers.push(currentPage);
        }

        if (currentPage < totalPages - 1) {
          pageNumbers.push(-2);
        }
      } else {
        let startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, startPage + 2);

        if (endPage === totalPages - 1) {
          startPage = Math.max(2, endPage - 2);
        }

        if (startPage > 2) {
          pageNumbers.push(-1);
        }

        for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(i);
        }

        if (endPage < totalPages - 1) {
          pageNumbers.push(-2);
        }
      }

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

      <AnimatePresence mode="wait">
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber < 0) {
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
