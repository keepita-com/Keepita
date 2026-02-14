import { motion } from "framer-motion";
import { Package, Smartphone, Square, Zap } from "lucide-react";
import React from "react";
import { cn } from "../../../../../shared/utils/cn";
import type { HomescreenItem, ItemType } from "../types/homescreen.types";

interface HomescreenAppIconProps {
  item: HomescreenItem;
  size?: "sm" | "md" | "lg" | "xs";
  onClick?: (item: HomescreenItem) => void;
  showLabel?: boolean;
  className?: string;
}

const HomescreenAppIcon: React.FC<HomescreenAppIconProps> = ({
  item,
  size = "md",
  onClick,
  showLabel = true,
  className,
}) => {
  const getItemTypeIcon = (itemType: ItemType) => {
    switch (itemType) {
      case "app":
        return <Smartphone className="w-3 h-3" />;
      case "widget":
        return <Package className="w-3 h-3" />;
      case "folder":
        return <Square className="w-3 h-3" />;
      default:
        return <Smartphone className="w-3 h-3" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "w-5 h-5 text-xs";
      case "sm":
        return "w-10 h-10 text-sm";
      case "md":
        return "w-12 h-12 text-lg";
      case "lg":
        return "w-16 h-16 text-2xl";
      default:
        return "w-12 h-12 text-lg";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(item)}
      className={cn(
        "flex flex-col items-center gap-0.5 cursor-pointer p-0.5 rounded-lg hover:bg-white/20 transition-all duration-200",
        onClick && "cursor-pointer",
        item.is_hidden && "opacity-50",
        className,
      )}
      title={`${item.app_name} (${item.item_type})`}
    >
      <div
        className={cn(
          "bg-transparent rounded-2xl flex items-center justify-center relative overflow-hidden",
          getSizeClasses(),
        )}
      >
        <img
          src={item.app_icon_url}
          alt={item.app_name}
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
        />

        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
          {getItemTypeIcon(item.item_type)}
        </div>

        {item.item_type === "widget" && (
          <div className="absolute -bottom-1 -left-1 bg-purple-500 text-white rounded-full p-0.5">
            <Zap className="w-2 h-2" />
          </div>
        )}
      </div>

      {showLabel && (
        <span className="text-[10px] text-white font-medium text-center max-w-12 truncate leading-tight">
          {item.app_name}
        </span>
      )}

      {showLabel && (
        <span className="text-[8px] text-white/60 font-mono leading-none">
          ({item.x}, {item.y})
        </span>
      )}
    </motion.div>
  );
};

export default HomescreenAppIcon;
