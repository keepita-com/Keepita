import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type NavItem } from "../types";
import { useNavigation } from "../hooks/useNavigation";

interface NavBarProps {
  navItems: NavItem[];
}

const NavBar: React.FC<NavBarProps> = ({ navItems }) => {
  const { isActive } = useNavigation();
  return (
    <div className="hidden lg:flex justify-center items-center flex-1">
      <nav className="flex justify-center">
        <ul className="flex items-center gap-px">
          {navItems.map((item) => (
            <motion.li
              key={item.name}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-1 px-2 py-1 mx-0.5 rounded-md relative overflow-hidden group transition-all duration-300 ${
                  isActive(item.path)
                    ? "text-sky-400 font-medium"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1">
                  {item.icon && <span className="text-xs">{item.icon}</span>}
                  <span className="font-medium text-xs">{item.name}</span>
                </span>
                {isActive(item.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-sky-500"
                    layoutId="navbar-indicator"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                  />
                )}
                <motion.div
                  className="absolute inset-0 bg-white/5 dark:bg-gray-700/20 rounded-lg opacity-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
