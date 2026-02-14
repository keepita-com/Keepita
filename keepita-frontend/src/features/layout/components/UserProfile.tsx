import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, UserRoundPen, Orbit, BellRing } from "lucide-react";
import { useAuthStore } from "../../../features/auth/store";

const navigationItems = [
  {
    title: "profile",
    icon: UserRoundPen,
    href: "/profile",
  },
  {
    title: "plans",
    icon: Orbit,
    href: "/plans",
  },
  {
    title: "notifications",
    icon: BellRing,
    href: "/notifications",
  },
];

interface UserProfileProps {
  userName: string;
  email: string;
  initials: string;
  profileImage?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userName,
  email,
  initials,
  profileImage,
}) => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [profileImgSrc, setProfileImgSrc] = useState<string | undefined>(
    profileImage
  );
  useEffect(() => {
    if (user?.profile_image) {
      setProfileImgSrc(user.profile_image);
    } else if (profileImage) {
      setProfileImgSrc(profileImage);
    }
  }, [user?.profile_image, profileImage]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };
  return (
    <div className="dropdown dropdown-end">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <label
          tabIndex={0}
          className="relative group cursor-pointer flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-all duration-300 px-1.5 py-1 rounded-lg"
        >
          {profileImgSrc ? (
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <img
                src={profileImgSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center border border-white/20 shadow-lg">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          )}
          <div className="hidden md:block">
            <span className="text-sm text-gray-200 font-medium">
              {userName.split(" ")[0]}
            </span>
          </div>
        </label>
      </motion.div>
      <ul
        tabIndex={0}
        className="dropdown-content mt-4 p-3 shadow-xl bg-gray-900  backdrop-blur-xl rounded-2xl w-60 gap-1 border border-white/10 text-gray-100"
      >
        <div className="px-3 py-2 mb-2">
          <div className="font-medium text-white">{userName}</div>
          <div className="text-sm text-gray-400">{email}</div>
        </div>
        <div className="h-px bg-gray-800 my-2"></div>
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <li
              className="list-none"
              key={item.icon + item.title + Math.random() + item.href}
            >
              <Link
                to={item.href}
                className="flex items-center gap-3 rounded-lg py-2.5 px-3 hover:bg-white/10 transition-all duration-200"
              >
                <item.icon size={16} strokeWidth={1.5} />
                <p className="capitalize">{item.title}</p>
              </Link>
            </li>
          ))}
        </div>
        <div className="h-px bg-gray-800 my-2"></div>
        <li className="list-none">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg w-full text-left py-2.5 px-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserProfile;
