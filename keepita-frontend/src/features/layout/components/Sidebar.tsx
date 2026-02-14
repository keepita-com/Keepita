import React, { useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, UserRoundPen, LogIn } from "lucide-react";

import { useNavigation } from "../hooks/useNavigation";
import { useAuth } from "../../auth/hooks/auth.hooks";

import { type NavItem } from "../types";

interface SidebarProps {
  navItems: NavItem[];
  onDrawerClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, onDrawerClose }) => {
  const { isActive } = useNavigation();
  const { clearAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        onDrawerClose();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [onDrawerClose]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
    onDrawerClose();
  };

  return (
    <div className="p-4 w-80 bg-gray-900/95 backdrop-blur-lg text-gray-100 flex flex-col h-full border-l border-white/10">
      {}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-700/30">
        <div className="bg-gradient-to-r from-sky-500 to-violet-500 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
          <span className="text-white font-bold text-xl">K</span>
        </div>
        <div className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
          Keepita
        </div>
      </div>
      {}
      <ul className="pt-6 space-y-2">
        {}
        <li className="text-xs uppercase text-gray-500 font-semibold tracking-wider px-4 pb-2">
          Navigation
        </li>
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex gap-3 items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-sky-400 font-medium"
                  : "hover:bg-white/5 text-gray-300 hover:text-white"
              }`}
              onClick={onDrawerClose}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      {}
      <div className="mt-auto border-t border-gray-800/30 pt-5">
        <ul className="space-y-2">
          {}
          <li className="text-xs uppercase text-gray-500 font-semibold tracking-wider px-4 pb-2">
            Account
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className="flex gap-3 items-center py-3 px-4 rounded-xl transition-all duration-300 hover:bg-white/5 text-gray-300 hover:text-white"
                >
                  <User size={18} strokeWidth={1.5} />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <a className="flex gap-3 items-center py-3 px-4 rounded-xl transition-all duration-300 hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer">
                  <Settings size={18} strokeWidth={1.5} />
                  <span>Settings</span>
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex gap-3 items-center py-3 px-4 rounded-xl transition-all duration-300 hover:bg-red-500/10 text-red-400 hover:text-red-300 w-full text-left"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className="flex gap-3 items-center py-3 px-4 rounded-xl transition-all duration-300 hover:bg-white/5 text-gray-300 hover:text-white"
                >
                  <LogIn size={18} strokeWidth={1.5} />
                  <span>Login</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="flex gap-3 items-center py-3 px-4 rounded-xl transition-all duration-300 hover:bg-white/5 text-gray-300 hover:text-white"
                >
                  <UserRoundPen size={18} strokeWidth={1.5} />
                  <span>Register</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
