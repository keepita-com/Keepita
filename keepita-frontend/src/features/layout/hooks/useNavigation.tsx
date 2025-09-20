import { Database, Home } from "lucide-react";
import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { type NavItem } from "../types";

export const useNavigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: "Home", icon: <Home size={18} />, path: "/" },
    { name: "Backups", icon: <Database size={18} />, path: "/backups" },
  ];

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prevState) => !prevState);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") {
        return location.pathname === path;
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  return {
    navItems,
    isDrawerOpen,
    toggleDrawer,
    closeDrawer,
    location,
    isActive,
  };
};
