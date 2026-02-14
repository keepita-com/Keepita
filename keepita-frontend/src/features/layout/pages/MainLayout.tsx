import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, Link } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";
import { useNavigation } from "../hooks/useNavigation";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ANIMATION_PRESETS, Z_INDEX } from "../constants";
import Logo from "../components/Logo";
import NavBar from "../components/NavBar";
import MobileMenuButton from "../components/MobileMenuButton";
import Notifications from "../components/Notifications";
import UserProfile from "../components/UserProfile";
import Sidebar from "../components/Sidebar";
import { useAuthStore } from "../../../features/auth/store";
import AnimatedBackground from "../../../shared/components/AnimatedBackground";
import { useLoadingStore } from "../../../store/loadingStore";
import FeedbackModal from "../../home/components/FeedbackModal";

const MainLayout: React.FC = () => {
  const { navItems, isDrawerOpen, toggleDrawer, closeDrawer } = useNavigation();
  const { isPageLoading } = useLoadingStore();
  const user = useAuthStore((state) => state.user);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "John Doe";
  const email = user?.email || "john@example.com";
  const initials =
    (firstName && lastName
      ? `${firstName[0]}${lastName[0]}`
      : fullName.substring(0, 2)) || "JD";
  const profileImage = user?.profile_image || undefined;

  return (
    <ThemeProvider>
      <div className="drawer drawer-end bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900">
        <input
          id="main-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isDrawerOpen}
          aria-label="Toggle navigation menu"
        />
        <div className="drawer-content relative z-10 flex flex-col">
          <AnimatePresence>
            {!isPageLoading && (
              <motion.div
                className="w-full flex justify-center px-4 sm:px-6 py-3 fixed top-0"
                style={{ zIndex: Z_INDEX.header }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={ANIMATION_PRESETS.spring.medium}
              >
                <motion.header
                  className="w-full max-w-3xl backdrop-blur-xl bg-gray-900/30 border border-white/20 shadow-lg rounded-2xl"
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={ANIMATION_PRESETS.spring.medium}
                >
                  <div className="navbar flex justify-between px-4 sm:px-6 w-full h-14">
                    <MobileMenuButton
                      isDrawerOpen={isDrawerOpen}
                      onToggleDrawer={toggleDrawer}
                    />
                    <Logo />
                    <NavBar navItems={navItems} />

                    <div className="flex-none gap-2 sm:gap-3 flex items-center">
                      {!user && (
                        <div className="hidden lg:flex items-center gap-2">
                          <Link
                            to="/login"
                            className="text-gray-300 hover:text-white font-medium transition-colors duration-200 text-sm px-2 py-1"
                          >
                            Log In
                          </Link>
                          <Link
                            to="/register"
                            className="px-3 py-1.5 text-sm bg-gradient-to-r from-sky-500 to-violet-500 rounded-lg text-white font-medium shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300"
                          >
                            Sign Up
                          </Link>
                        </div>
                      )}
                      {user && (
                        <>
                          <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="relative flex items-center justify-center h-9 w-9 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-lg cursor-pointer text-gray-300 hover:text-white hover:scale-105 active:scale-95"
                            title="Send Feedback"
                          >
                            <MessageSquarePlus size={18} strokeWidth={1.5} />
                          </button>

                          <Notifications />

                          <UserProfile
                            userName={fullName}
                            email={email}
                            initials={initials}
                            profileImage={profileImage}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </motion.header>
              </motion.div>
            )}
          </AnimatePresence>
          <main
            className={`flex-1 overflow-y-auto relative ${
              !isPageLoading ? "pt-17" : "pt-0"
            }`}
          >
            <AnimatedBackground />
            <div className="relative w-full z-10 max-w-7xl mx-auto mt-[10px] px-4 py-8">
              <Outlet />
            </div>
          </main>
        </div>
        <div className="drawer-side z-20">
          <label
            htmlFor="main-drawer"
            className="drawer-overlay"
            onClick={closeDrawer}
          ></label>
          <Sidebar navItems={navItems} onDrawerClose={closeDrawer} />
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </ThemeProvider>
  );
};

export default MainLayout;
