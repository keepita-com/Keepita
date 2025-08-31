import React from "react";
import { motion } from "framer-motion";

interface ContactListSkeletonProps {
  count?: number;
  isProcessing?: boolean;
}

const ContactListSkeleton: React.FC<ContactListSkeletonProps> = ({
  count = 6,
  isProcessing = false,
}) => {
  const getItemDelay = (index: number): number => {
    return 0.08 * index;
  };

  return (
    <div className="bg-white space-y-1 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isProcessing ? [0.7, 0.4, 0.7] : 0.7,
            y: 0,
            transition: {
              opacity: isProcessing
                ? {
                    repeat: Infinity,
                    duration: 1.5,
                    repeatType: "reverse",
                  }
                : {},
              delay: getItemDelay(index),
              duration: 0.3,
            },
          }}
          className="bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center px-4 py-3.5">
            {/* Profile Avatar Skeleton */}
            <div className="relative mr-4 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                {/* Initials placeholder */}
                <div className="w-6 h-4 bg-gray-400 rounded animate-pulse"></div>
              </div>
              {/* Random favorite indicator skeleton */}
              {Math.random() > 0.7 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-200 rounded-full animate-pulse"></div>
              )}
            </div>

            {/* Contact Info Skeleton */}
            <div className="flex-1 min-w-0">
              {/* Name skeleton */}
              <div className="h-5 bg-gray-200 animate-pulse rounded w-32 mb-1"></div>

              {/* Phone number skeleton */}
              <div className="h-4 bg-gray-200 animate-pulse rounded w-28"></div>
            </div>

            {/* Message Button Skeleton */}
            <div className="flex items-center space-x-1 ml-3">
              <div className="w-9 h-9 bg-green-100 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-4 h-4 bg-green-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ContactListSkeleton;
