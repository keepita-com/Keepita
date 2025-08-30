import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isDrawerOpen,
  onToggleDrawer,
}) => {
  return (
    <div className="flex-none lg:hidden">
      <label
        className="rounded-lg text-gray-300 hover:text-white h-8 w-8 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/5"
        onClick={onToggleDrawer}
      >
        <AnimatePresence initial={false} mode="wait">
          {isDrawerOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </label>
    </div>
  );
};

export default MobileMenuButton;
