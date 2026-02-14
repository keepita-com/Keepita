import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type {
  HomescreenFolder,
  HomescreenItem,
} from "../types/homescreen.types";
import HomescreenAppIcon from "./HomescreenAppIcon";
import { cn } from "../../../../../shared/utils/cn";

interface FolderProps {
  folder: HomescreenFolder;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAppClick?: (app: HomescreenItem) => void;
}

const Folder: React.FC<FolderProps> = ({
  folder,
  isOpen,
  onOpen,
  onClose,
  onAppClick,
}) => {
  const folderRef = useRef<HTMLDivElement>(null);
  const [folderPosition, setFolderPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (folderRef.current) {
      const rect = folderRef.current.getBoundingClientRect();
      setFolderPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [isOpen]);

  const getFolderColor = (colorNumber: number) => {
    return `#${colorNumber.toString(16).padStart(6, "0")}`;
  };

  const previewApps = folder.items.slice(0, 4);

  const renderFolderIcon = () => (
    <motion.div
      ref={folderRef}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onOpen}
      className={cn(
        "relative w-12 h-12 rounded-[22%] cursor-pointer",
        "bg-gradient-to-br from-gray-200 to-gray-300",
        "border border-gray-400/30",
        "shadow-md hover:shadow-lg transition-all duration-200",
      )}
      style={{
        backgroundColor: folder.color
          ? getFolderColor(folder.color)
          : undefined,
      }}
    >
      <div className="absolute inset-0 rounded-[22%] bg-gradient-to-br from-white/30 to-black/5" />

      <div className="absolute inset-1.5 grid grid-cols-2 gap-0.5">
        {previewApps.map((app) => (
          <div
            key={app.id}
            className="w-4 h-4 rounded-lg bg-white/90 flex items-center justify-center overflow-hidden shadow-sm"
          >
            <HomescreenAppIcon
              item={app}
              size="xs"
              showLabel={false}
              onClick={() => {}}
            />
          </div>
        ))}

        {Array.from({ length: 4 - previewApps.length }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className="w-4 h-4 rounded-lg bg-white/50"
          />
        ))}
      </div>

      {folder.items_count > 4 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-[10px] text-white font-bold leading-none">
            {folder.items_count > 9 ? "9+" : folder.items_count}
          </span>
        </div>
      )}
    </motion.div>
  );

  const renderOpenedFolder = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{
          scale: 0.1,
          x: folderPosition.x - window.innerWidth / 2,
          y: folderPosition.y - window.innerHeight / 2,
        }}
        animate={{
          scale: 1,
          x: 0,
          y: 0,
        }}
        exit={{
          scale: 0.1,
          x: folderPosition.x - window.innerWidth / 2,
          y: folderPosition.y - window.innerHeight / 2,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
        className="bg-white/95 backdrop-blur-md rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {folder.title || "Folder"}
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-full bg-gray-200/80 hover:bg-gray-300/80 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {folder.items.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { delay: index * 0.05 },
              }}
              className="flex flex-col items-center"
            >
              <HomescreenAppIcon
                item={app}
                size="md"
                showLabel={false}
                onClick={() => {
                  onAppClick?.(app);
                  onClose();
                }}
                className="mb-2"
              />
              <span className="text-xs text-gray-700 text-center truncate w-full">
                {app.app_name}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">
            {folder.items_count} {folder.items_count === 1 ? "app" : "apps"}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {renderFolderIcon()}
      <AnimatePresence>{isOpen && renderOpenedFolder()}</AnimatePresence>
    </>
  );
};

export default Folder;
