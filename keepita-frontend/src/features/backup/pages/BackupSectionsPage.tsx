import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import {
  Users,
  Phone,
  MessageSquare,
  Smartphone,
  Bluetooth,
  FolderOpen,
  ArrowLeft,
  Clock,
  Wifi,
  Grid3X3,
  Globe,
  PaintbrushVertical,
  ChevronDown,
} from "lucide-react";
import { AnimatedBackground, PageLoader } from "@/shared/components";
import { useBackupDetails } from "../hooks/backup.hooks";
import { useBackupTheme } from "../store/backupThemes.store";
import EmptyState from "../components/EmptyState";

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
  useDocumentTitle("Backup Sections | Keepita");
  const navigate = useNavigate();

  const [isOsThemeOpen, setIsOsThemeOpen] = useState(false);
  const { setBackupTheme, theme } = useBackupTheme();
  const { backup, isLoading, error } = useBackupDetails(backupId);
  const osThemeRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !backup) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <AnimatedBackground className="absolute inset-0 z-0" />
        <div className="max-w-lg w-full z-10 p-4">
          <EmptyState
            icon="no-results"
            title="Backup Not Found"
            description="The backup you are looking for differs or does not exist."
          />
          <motion.div
            className="text-center -mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/backups")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              Return to Backups
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleOsThemeSelect = (theme: string) => {
    setBackupTheme(theme);
    setIsOsThemeOpen(false);
    osThemeRef.current?.blur();
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
      id: "call-logs",
      title: "Call Logs",
      description: "Complete call history and duration",
      icon: Phone,
      count: backup?.call_logs_count || 0,
      isAvailable: Boolean(backup?.call_logs_count),
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
      id: "alarms",
      title: "Alarms & Timers",
      description: "Clock settings and schedules",
      icon: Clock,
      count: backup?.alarms_count || 0,
      isAvailable: Boolean(backup?.alarms_count),
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
      id: "homescreen",
      title: "Home Layout",
      description: "App arrangements and widgets",
      icon: Grid3X3,
      count: backup?.home_screen_items_count || 0,
      isAvailable: Boolean(backup?.home_screen_items_count),
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
              className="flex items-center p-1.5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-50"
            >
              <div className="flex items-center gap-3 pr-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <Smartphone className="w-5 h-5 text-indigo-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                    Device Model
                  </span>
                  <span className="text-sm font-bold text-white leading-tight">
                    {isLoading
                      ? "Loading..."
                      : backup?.model_name || "Unknown Device"}
                  </span>
                </div>
              </div>

              <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-1"></div>

              <div className="relative" ref={osThemeRef}>
                <button
                  onClick={() => setIsOsThemeOpen(!isOsThemeOpen)}
                  className={`
                    flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 group
                    ${
                      isOsThemeOpen
                        ? "bg-white/10 text-white"
                        : "hover:bg-white/5 text-white/70 hover:text-white"
                    }
                  `}
                >
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    <PaintbrushVertical className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium capitalize">
                    {theme || "Samsung"} Theme
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/40 transition-transform duration-300 ${
                      isOsThemeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOsThemeOpen && (
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute right-0 top-full mt-3 w-48 p-1 bg-[#0F1115]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {["Apple", "Samsung", "Xiaomi"].map((os) => (
                        <li key={os}>
                          <button
                            className={`
                              w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                              ${
                                theme?.toLowerCase() === os.toLowerCase()
                                  ? "bg-indigo-500/20 text-indigo-300 font-medium"
                                  : "text-white/60 hover:text-white hover:bg-white/5"
                              }
                            `}
                            onClick={() => handleOsThemeSelect(os)}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                os === "Apple"
                                  ? "bg-gray-200"
                                  : os === "Samsung"
                                    ? "bg-blue-500"
                                    : "bg-orange-500"
                              }`}
                            ></div>
                            {os}
                          </button>
                        </li>
                      ))}
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
            : sections.map((section: BackupSection, index: number) => {
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
                    {}
                    {isDisabled && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-white font-mono"></div>
                        </div>
                      </div>
                    )}

                    {}
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
