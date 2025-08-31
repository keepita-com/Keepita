import React from "react";

interface CallLogSkeletonListProps {
  count?: number;
}

/**
 * Skeleton loader for call logs list following Samsung One UI design
 */
const CallLogSkeletonList: React.FC<CallLogSkeletonListProps> = ({
  count = 10,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 mb-3 border-2 border-gray-100 animate-pulse"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            {/* Left side - Icon and content */}
            <div className="flex items-start space-x-4 flex-1 mb-3 sm:mb-0">
              {/* Call type icon skeleton */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              </div>

              {/* Content skeleton */}
              <div className="flex-1 min-w-0">
                {/* Contact name and icon */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>

                {/* Phone number and call type badge */}
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Date and duration */}
            <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2 sm:ml-4">
              {/* Date skeleton */}
              <div className="text-left sm:text-right">
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>

              {/* Duration skeleton */}
              <div className="flex items-center">
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CallLogSkeletonList;
