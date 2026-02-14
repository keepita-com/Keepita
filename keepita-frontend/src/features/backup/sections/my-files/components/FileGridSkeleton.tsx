import React from "react";

interface FileGridSkeletonProps {
  count?: number;
}

const FileGridSkeleton: React.FC<FileGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-3 border border-gray-100 animate-pulse"
        >
          <div className="relative w-full aspect-square mb-3 bg-gray-200 rounded-xl overflow-hidden">
            <div className="absolute bottom-2 left-2 w-12 h-5 bg-gray-300 rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="flex items-center justify-between">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileGridSkeleton;
