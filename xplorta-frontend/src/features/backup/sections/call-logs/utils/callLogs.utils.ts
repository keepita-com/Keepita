import type { CallType, GetCallLogsParams } from "../types/callLogs.types";
import { buildQueryParams } from "../../../../../shared/utils";

export const formatPhoneNumber = (number: string): string => {
  if (!number) return "";
  const cleaned = number.replace(/\D/g, "");

  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  } else if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3");
  } else if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{1,3})(\d{3})(\d{3})(\d+)/, "+$1 $2 $3 $4");
  }

  return number;
};

export const formatDuration = (seconds: number): string => {
  if (seconds === 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
};

export const formatCallDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const callDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const timeFormat = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (callDate.getTime() === today.getTime()) {
    return `Today, ${timeFormat.format(date)}`;
  }

  if (callDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeFormat.format(date)}`;
  }

  // Check if it was within the last week
  if (now.getTime() - callDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
    const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long" });
    return `${dayFormat.format(date)}, ${timeFormat.format(date)}`;
  }

  const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });

  return `${dateFormat.format(date)}, ${timeFormat.format(date)}`;
};

export const getCallTypeColor = (type: CallType): string => {
  const colors: Record<CallType, string> = {
    INCOMING: "#1976D2", // Blue
    OUTGOING: "#388E3C", // Green
    MISSED: "#D32F2F", // Red
  };
  return colors[type] || "#8E8E93"; // Default gray
};

export const getCallTypeIcon = (type: CallType): string => {
  const icons: Record<CallType, string> = {
    INCOMING: "call_received",
    OUTGOING: "call_made",
    MISSED: "call_missed",
  };
  return icons[type] || "call"; // Default icon
};

export const buildCallLogsQueryParams = (
  params: Partial<GetCallLogsParams>
): Record<string, any> => {
  return buildQueryParams(params);
};
