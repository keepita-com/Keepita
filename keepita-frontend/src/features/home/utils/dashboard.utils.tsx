import React from "react";
import {
  BarChart3,
  Clock,
  Calendar,
  Settings,
  Bell,
  User,
  UserPlus,
  MessagesSquare,
  LayoutGrid,
  Contact,
  PhoneCall,
  Users,
  Archive,
  Orbit,
} from "lucide-react";
import type {
  DashboardOverviewResponse,
  DashboardOverviewResponseStats,
} from "../types/home.types";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export const getIconComponent = (
  iconName: string,
  size: number = 20,
  className: string = "",
) => {
  const icons: Record<string, React.ReactNode> = {
    MessagesSquare: (
      <MessagesSquare size={size} className={className || "text-sky-300"} />
    ),
    LayoutGrid: (
      <LayoutGrid size={size} className={className || "text-violet-300"} />
    ),
    Contact: <Contact size={size} className={className || "text-teal-300"} />,
    PhoneCall: (
      <PhoneCall size={size} className={className || "text-rose-300"} />
    ),

    BarChart3: (
      <BarChart3 size={size} className={className || "text-sky-300"} />
    ),
    Clock: <Clock size={size} className={className || "text-gray-300"} />,
    Calendar: <Calendar size={size} className={className || "text-white"} />,
    Settings: <Settings size={size} className={className || "text-rose-300"} />,
    Bell: <Bell size={size} className={className || "text-teal-300"} />,
    User: <User size={size} className={className || "text-sky-400"} />,
    UserPlus: (
      <UserPlus size={size} className={className || "text-violet-300"} />
    ),
  };

  return icons[iconName] || null;
};

const FREQUENT_CONTACTS_LIST_DEFAULT_STYLES = {
  icon: <Users size={14} className="text-sky-300" />,
  bgColor: "bg-teal-500/20",
  borderColor: "border-teal-500/20",
};

export const getFrequentContactsStyles = (
  contacts?: DashboardOverviewResponse["frequently_called_contacts"],
) => {
  return contacts?.map((c) => ({
    ...FREQUENT_CONTACTS_LIST_DEFAULT_STYLES,
    title: c.name,
    callCount: c.call_count,
    phoneModel: c.phone_model,
  }));
};

export const getQuickActionsData = () => [
  {
    icon: <User size={16} className="text-sky-300" />,
    title: "Profile",
    path: "/profile",
    bgColor: "rgba(56, 189, 248, 0.08)",
    hoverColor: "rgba(14, 165, 233, 0.2)",
    borderColor: "bg-sky-500/20",
    delay: 0.3,
  },

  {
    icon: <Archive size={16} className="text-teal-300" />,
    title: "Backups",
    path: "/backups",
    bgColor: "rgba(45, 212, 191, 0.08)",
    hoverColor: "rgba(20, 184, 166, 0.2)",
    borderColor: "bg-teal-500/20",
    delay: 0.5,
  },
  {
    icon: <Orbit size={16} className="text-rose-300" />,
    title: "Plans",
    path: "/plans",
    bgColor: "rgba(251, 113, 133, 0.08)",
    hoverColor: "rgba(244, 114, 182, 0.2)",
    borderColor: "bg-rose-500/20",
    delay: 0.6,
  },
];

const STATS_STACK_DEFAULT_STYLES = [
  {
    title: "Messages Count",
    value: 0,
    icon: "MessagesSquare",
    bgColor: "bg-sky-500/30",
    borderColor: "border-sky-500/30",
  },
  {
    title: "Apps Count",
    value: 0,
    icon: "LayoutGrid",
    bgColor: "bg-violet-500/30",
    borderColor: "border-violet-500/30",
  },
  {
    title: "Contacts Count",
    value: 0,
    icon: "Contact",
    bgColor: "bg-teal-500/30",
    borderColor: "border-teal-500/30",
  },
  {
    title: "Calls Count",
    value: 0,
    icon: "PhoneCall",
    bgColor: "bg-rose-500/30",
    borderColor: "border-rose-500/30",
  },
];

export const getDashboardStatsInfo = (
  stats?: DashboardOverviewResponseStats,
) => {
  if (!stats) return STATS_STACK_DEFAULT_STYLES;

  const statsData = Object.values(stats);
  const statsInfo = statsData.map((stat, index) => ({
    ...STATS_STACK_DEFAULT_STYLES[index],
    value: stat,
  }));

  return statsInfo;
};
