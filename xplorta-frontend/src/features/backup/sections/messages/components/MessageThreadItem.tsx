import { MessageCircle, Phone } from "lucide-react";
import React from "react";
import { samsungColors } from "../../../constants/samsung.constants";
import type { MessageThread } from "../types/message.types";
import { highlightSearchTerms } from "../utils/searchUtils";

interface MessageThreadItemProps {
  thread: MessageThread;
  isSelected?: boolean;
  onClick?: () => void;
  searchQuery?: string;
}

export const MessageThreadItem: React.FC<MessageThreadItemProps> = ({
  thread,
  isSelected = false,
  onClick,
  searchQuery = "",
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatLastMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };
  const getContactName = () => {
    if (thread.contact?.display_name) return thread.contact.display_name;
    if (thread.contact?.name) return thread.contact.name;
    return thread.address;
  };

  const getContactInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isPhoneNumber = (address: string) => {
    return /^\+?\d[\d\s\-\(\)]+$/.test(address);
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200
        hover:bg-opacity-50 mb-1
        ${isSelected ? "shadow-sm" : ""}
      `}
      style={{
        backgroundColor: isSelected
          ? samsungColors.primary[300] + "20"
          : samsungColors.background.secondary,
        border: isSelected
          ? `1px solid ${samsungColors.primary[300]}`
          : `1px solid transparent`,
      }}
    >
      {" "}
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {thread.contact?.profile_image ? (
          <img
            src={thread.contact.profile_image}
            alt={getContactName()}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: samsungColors.primary[500] }}
          >
            {isPhoneNumber(thread.address) ? (
              <Phone size={20} />
            ) : (
              <span className="text-sm">
                {getContactInitials(getContactName())}
              </span>
            )}
          </div>
        )}{" "}
        {/* Unread badge */}
        {thread.unread_count && thread.unread_count > 0 && (
          <div
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: samsungColors.status.error }}
          >
            {thread.unread_count > 99 ? "99+" : thread.unread_count}
          </div>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          {" "}
          <h3
            className={`font-medium truncate ${
              thread.unread_count && thread.unread_count > 0
                ? "font-semibold"
                : ""
            }`}
            style={{
              color:
                thread.unread_count && thread.unread_count > 0
                  ? samsungColors.text.primary
                  : samsungColors.text.primary,
            }}
          >
            {searchQuery
              ? highlightSearchTerms(getContactName(), searchQuery)
              : getContactName()}
          </h3>
          <span
            className="text-xs flex-shrink-0 ml-2"
            style={{
              color:
                thread.unread_count && thread.unread_count > 0
                  ? samsungColors.primary[500]
                  : samsungColors.text.secondary,
            }}
          >
            {formatDate(thread.last_message_date)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {" "}
          <p
            className={`text-sm truncate ${
              thread.unread_count && thread.unread_count > 0
                ? "font-medium"
                : ""
            }`}
            style={{
              color:
                thread.unread_count && thread.unread_count > 0
                  ? samsungColors.text.primary
                  : samsungColors.text.secondary,
            }}
          >
            {searchQuery
              ? highlightSearchTerms(
                  formatLastMessage(thread.last_message),
                  searchQuery
                )
              : formatLastMessage(thread.last_message)}
          </p>
          {/* Message count indicator */}
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <MessageCircle
              size={12}
              style={{ color: samsungColors.text.secondary }}
            />
            <span
              className="text-xs"
              style={{ color: samsungColors.text.secondary }}
            >
              {thread.messages_count || 0}
            </span>
          </div>
        </div>

        {/* Additional info for phone numbers */}
        {!thread.contact && isPhoneNumber(thread.address) && (
          <p
            className="text-xs mt-1"
            style={{ color: samsungColors.text.secondary }}
          >
            {thread.address}
          </p>
        )}
      </div>
      {/* Samsung-style selection indicator */}
      {isSelected && (
        <div
          className="w-1 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: samsungColors.primary[500] }}
        />
      )}
    </div>
  );
};
