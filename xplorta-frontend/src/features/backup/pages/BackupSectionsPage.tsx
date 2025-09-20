import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import {
  Users,
  MessageSquare,
  Smartphone,
  Bluetooth,
  FolderOpen,
  ArrowLeft,
  Wifi,
  Globe,
  PaintbrushVertical,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { AnimatedBackground } from "@/shared/components";
import { useBackupDetails } from "../hooks/backup.hooks";

// Define type for sections
interface BackupSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  isAvailable: boolean;
}

const CardSkeleton = () => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/50 border border-white/10 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 rounded-lg bg-white/10">
        <div className="w-5 h-5 bg-gray-600 rounded"></div>
      </div>
      <div className="text-right">
        <div className="h-4 w-8 bg-gray-600 rounded mb-1"></div>
        <div className="h-3 w-10 bg-gray-700 rounded"></div>
      </div>
    </div>
    <div>
      <div className="h-5 w-3/4 bg-gray-600 rounded mb-2"></div>
      <div className="h-3 w-full bg-gray-700 rounded mb-1"></div>
      <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
    </div>
  </div>
);

const BackupSectionsPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  useDocumentTitle("Backup Sections | xplorta");
  const [selectedOsTheme, setSelectedOsTheme] = useState("Apple Theme");
  const [selectedDarkAndLightTheme, setSelectedDarkAndLightTheme] =
    useState("Dark Theme");
  const [isOsThemeOpen, setIsOsThemeOpen] = useState(false);
  const [isDarkLightThemeOpen, setIsDarkLightThemeOpen] = useState(false);
  const osThemeRef = useRef<HTMLDivElement>(null);
  const darkLightThemeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { backup, isLoading } = useBackupDetails(backupId);

  const handleOsThemeSelect = (theme: string) => {
    setSelectedOsTheme(theme);
    setIsOsThemeOpen(false);
    osThemeRef.current?.blur();
  };

  const handleDarkAndLightModeTheme = (theme: string) => {
    setSelectedDarkAndLightTheme(theme);
    setIsDarkLightThemeOpen(false);
    darkLightThemeRef.current?.blur();
  };

  const sections: BackupSection[] = [
    {
      id: "contacts",
      title: "Contacts",
      description: "All saved contacts and phonebook entries",
      icon: Users,
      count: backup?.contacts_count || 0,
      isAvailable: Boolean(backup?.contacts_count),
    },
    {
      id: "messages",
      title: "Messages",
      description: "SMS, MMS and chat conversations",
      icon: MessageSquare,
      count: backup?.messages_count || 0,
      isAvailable: Boolean(backup?.messages_count),
    },
    {
      id: "apps",
      title: "Apps & Data",
      description: "Installed apps and their data",
      icon: Smartphone,
      count: backup?.apps_count || 0,
      isAvailable: Boolean(backup?.apps_count),
    },
    {
      id: "bluetooth",
      title: "Bluetooth",
      description: "Paired devices and connections",
      icon: Bluetooth,
      count: backup?.bluetooth_devices_count || 0,
      isAvailable: Boolean(backup?.bluetooth_devices_count),
    },
    {
      id: "files",
      title: "Files",
      description: "Files and document storage",
      icon: FolderOpen,
      count: backup?.files_count || 0,
      isAvailable: Boolean(backup?.files_count),
    },
    {
      id: "wifi",
      title: "WiFi Networks",
      description: "Saved networks and passwords",
      icon: Wifi,
      count: backup?.wifi_networks_count || 0,
      isAvailable: Boolean(backup?.wifi_networks_count),
    },
    {
      id: "browser",
      title: "Browser Data",
      description: "Bookmarks, history and downloads",
      icon: Globe,
      count: backup?.browser_count || 0,
      isAvailable: Boolean(backup?.browser_count),
    },
  ];

  const handleSectionClick = (sectionId: string, isAvailable: boolean) => {
    if (!isAvailable) {
      console.log(`Section ${sectionId} is not available`);
      return;
    }
    navigate(`/backups/${backupId}/${sectionId}`);
  };

  const handleBackClick = () => navigate("/backups");

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const cardVariants = {
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  return (
    <div className="relative min-h-screen bg-black">
      <AnimatedBackground className="absolute inset-0 z-0" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackClick}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Backup Sections
                </h1>
                <p className="text-white/70 text-sm">
                  Choose a section to explore the backup data
                </p>
              </div>
            </div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={dropdownVariants}
              className="flex items-center space-x-2 rounded-xl px-6 py-4 backdrop-blur-sm bg-transparent z-50"
            >
              <Smartphone
                size={32}
                className="rounded-3xl w-10 h-10 p-2"
                style={{
                  background: "linear-gradient(to right, #8164F6, #527CF6)",
                }}
              />
              <span className="text-white font-bold text-xl">
                {isLoading ? "Loading..." : backup?.model_name || "No Model"}
              </span>
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              <div className="relative" ref={osThemeRef}>
                <button
                  onClick={() => setIsOsThemeOpen(!isOsThemeOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 transition-colors focus:outline-none"
                >
                  <PaintbrushVertical className="w-5 h-5" />
                  <div className="h-6 w-px bg-white/10 mx-1"></div>
                  <span>{selectedOsTheme}</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {isOsThemeOpen && (
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-52 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg z-50 p-2 space-y-1"
                    >
                      <li>
                        <button
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:text-white/70 active:text-gray-900 transition-colors ${
                            selectedOsTheme === "Apple Theme"
                              ? "text-gray-300 font-semibold"
                              : ""
                          }`}
                          onClick={() => handleOsThemeSelect("Apple Theme")}
                        >
                          <div
                            className="h-6 w-px"
                            style={{
                              background:
                                "linear-gradient(to right, #FFFFFF, #999999)",
                            }}
                          ></div>
                          Apple
                        </button>
                      </li>
                      <li>
                        <button
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:text-white/70 active:text-gray-900 transition-colors ${
                            selectedOsTheme === "Samsung Theme"
                              ? "text-gray-300 font-semibold"
                              : ""
                          }`}
                          onClick={() => handleOsThemeSelect("Samsung Theme")}
                        >
                          <div className="h-6 w-px bg-[#008AFF]"></div>
                          Samsung
                        </button>
                      </li>
                      <li>
                        <button
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:text-white/70 active:text-gray-900 transition-colors ${
                            selectedOsTheme === "Xiaomi Theme"
                              ? "text-gray-300 font-semibold"
                              : ""
                          }`}
                          onClick={() => handleOsThemeSelect("Xiaomi Theme")}
                        >
                          <div className="h-6 w-px bg-[#FF6900]"></div>
                          Xiaomi
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              <div className="relative" ref={darkLightThemeRef}>
                <button
                  onClick={() => setIsDarkLightThemeOpen(!isDarkLightThemeOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 transition-colors focus:outline-none"
                >
                  {selectedDarkAndLightTheme === "Dark Theme" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  <div className="h-6 w-px bg-white/10 mx-1"></div>
                  <span>{selectedDarkAndLightTheme}</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {isDarkLightThemeOpen && (
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-52 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg z-50 p-2 space-y-1"
                    >
                      <li>
                        <button
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:text-white/70 active:text-gray-900 transition-colors ${
                            selectedDarkAndLightTheme === "Dark Theme"
                              ? "text-gray-300 font-semibold"
                              : ""
                          }`}
                          onClick={() =>
                            handleDarkAndLightModeTheme("Dark Theme")
                          }
                        >
                          <Moon className="w-5 h-5" />
                          Dark
                        </button>
                      </li>
                      <li>
                        <button
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:text-white/70 active:text-gray-900 transition-colors ${
                            selectedDarkAndLightTheme === "Light Theme"
                              ? "text-gray-300 font-semibold"
                              : ""
                          }`}
                          onClick={() =>
                            handleDarkAndLightModeTheme("Light Theme")
                          }
                        >
                          <Sun className="w-5 h-5" />
                          Light
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 mt-[5rem]">
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))
            : sections.map((section, index) => {
                const Icon = section.icon;
                const isDisabled = !section.isAvailable;

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    variants={cardVariants}
                    whileHover={isDisabled ? {} : "hover"}
                    whileTap={isDisabled ? {} : "tap"}
                    onClick={() =>
                      handleSectionClick(section.id, section.isAvailable)
                    }
                    className={`
                      mobile-backup-card group relative p-4 rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/50
                      border border-white/10 hover:border-white/30 transition-all duration-400
                      ${!isDisabled && "cursor-pointer"}
                    `}
                    role="button"
                    aria-label={`View ${section.title} section`}
                  >
                    {/* Disabled overlay */}
                    {isDisabled && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-white font-mono"></div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-3">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          className={`p-2 rounded-lg bg-white/10 ${
                            isDisabled ? "bg-gray-900/50" : ""
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isDisabled ? "text-gray-400" : "text-white"
                            }`}
                          />
                        </motion.div>
                        <div className="text-right">
                          <div
                            className={`text-xs font-bold ${
                              isDisabled || section.count === 0
                                ? "text-gray-500"
                                : "text-blue-100"
                            }`}
                          >
                            {section.count}
                          </div>
                          <div className="text-xs text-gray-400">items</div>
                        </div>
                      </div>

                      <div className="flex-grow">
                        <h3 className="font-bold mb-1 text-white">
                          {section.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-400">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-white/60 text-lg p-10">
            Click on any section above to explore the backup data
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BackupSectionsPage;
