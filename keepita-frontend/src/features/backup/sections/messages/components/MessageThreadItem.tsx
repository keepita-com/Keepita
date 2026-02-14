import { ChevronRight, Phone, UserRound } from "lucide-react";
import React from "react";
import { samsungColors } from "../../../constants/samsung.constants";
import type { MessageThread } from "../types/message.types";
import { highlightSearchTerms } from "../utils/searchUtils";
import { xiaomiColors } from "@/features/backup/constants/xiaomi.constants";
import { getInitials } from "../utils/message.utils";
import twemoji from "twemoji";

const renderAppleStyledText = (text: string, query: string) => {
  const parts = query ? text.split(new RegExp(`(${query})`, "gi")) : [text];
  return (
    <>
      {parts.map((part, i) => {
        if (query && part.toLowerCase() === query.toLowerCase()) {
          return (
            <mark
              key={i}
              className="bg-yellow-200 text-yellow-900 px-1 rounded"
            >
              {part}
            </mark>
          );
        }
        const html = twemoji.parse(part, {
          callback: (icon: string) => {
            return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.0/img/apple/64/${icon}.png`;
          },
          attributes: () => ({
            style: "width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin: 0 0.1em; display: inline-block;",
          }),
        });
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </>
  );
};


type Theme = "Samsung" | "Xiaomi" | "Apple";

interface MessageThreadItemProps {
  thread: MessageThread;
  isSelected?: boolean;
  onClick?: () => void;
  searchQuery?: string;
  theme?: Theme;
}

export const MessageThreadItem: React.FC<MessageThreadItemProps> = ({
  thread,
  isSelected = false,
  onClick,
  searchQuery = "",
  theme = "Samsung",
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
    return /^\+?\d[\d\s\-()]+$/.test(address);
  };

  const themeConfig = {
    Samsung: {
      containerClass: `flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-opacity-50 mb-1 ${isSelected ? "shadow-sm" : ""
        }`,
      containerStyle: {
        backgroundColor: isSelected
          ? samsungColors.primary[300] + "20"
          : samsungColors.background.secondary,
        border: isSelected
          ? `1px solid ${samsungColors.primary[300]}`
          : `1px solid transparent`,
      },
      avatarClass: "relative flex-shrink-0",
      avatarImgClass: "w-12 h-12 rounded-full object-cover",
      avatarDefaultClass:
        "w-12 h-12 rounded-full flex items-center justify-center text-white font-medium",
      avatarDefaultStyle: { backgroundColor: samsungColors.primary[500] },
      avatarIcon: isPhoneNumber(thread.address) ? (
        <Phone size={20} />
      ) : (
        <span className="text-sm">{getContactInitials(getContactName())}</span>
      ),
      unreadBadgeClass:
        "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold text-white",
      unreadBadgeStyle: { backgroundColor: samsungColors.status.error },
      nameClass: `font-medium truncate ${thread.unread_count && thread.unread_count > 0 ? "font-semibold" : ""
        }`,
      nameStyle: {
        color:
          thread.unread_count && thread.unread_count > 0
            ? samsungColors.text.primary
            : samsungColors.text.primary,
      },
      dateClass: "text-xs flex-shrink-0 ml-2",
      dateStyle: {
        color:
          thread.unread_count && thread.unread_count > 0
            ? samsungColors.primary[500]
            : samsungColors.text.secondary,
      },
      messageClass: `text-sm truncate ${thread.unread_count && thread.unread_count > 0 ? "font-medium" : ""
        }`,
      messageStyle: {
        color:
          thread.unread_count && thread.unread_count > 0
            ? samsungColors.text.primary
            : samsungColors.text.secondary,
      },
      messageCountContainerClass: "flex items-center gap-1 ml-2 flex-shrink-0",
      messageCountIconClass: "size-10",
      messageCountIconStyle: { color: samsungColors.text.secondary },
      messageCountTextClass: "text-xs",
      messageCountTextStyle: { color: samsungColors.text.secondary },
      phoneNumberClass: "text-xs mt-1",
      phoneNumberStyle: { color: samsungColors.text.secondary },
      selectionIndicatorClass: "w-1 h-8 rounded-full flex-shrink-0",
      selectionIndicatorStyle: { backgroundColor: samsungColors.primary[500] },
    },
    Xiaomi: {
      containerClass: `flex items-center gap-3 py-4 px-6 mx-1 cursor-pointer transition-all duration-200 hover:bg-opacity-50 mb-1 rounded-full`,
      containerStyle: {
        backgroundColor: isSelected
          ? xiaomiColors.background.tertiary
          : xiaomiColors.background.secondary,
      },
      avatarClass: "relative flex-shrink-0",
      avatarImgClass: "w-12 h-12 rounded-full object-cover",
      avatarDefaultClass:
        "w-12 h-12 rounded-full flex items-center justify-center text-white font-medium",
      avatarDefaultStyle: { backgroundColor: xiaomiColors.background.elevated },
      avatarIcon: thread?.contact?.display_name ? (
        <span className="text-white">
          {getInitials(thread?.contact?.display_name)}
        </span>
      ) : (
        <UserRound size={20} />
      ),
      unreadBadgeClass: "",
      unreadBadgeStyle: {},
      nameClass: `font-medium truncate ${thread.unread_count && thread.unread_count > 0 ? "font-semibold" : ""
        }`,
      nameStyle: {
        color:
          thread.unread_count && thread.unread_count > 0
            ? samsungColors.text.primary
            : samsungColors.text.primary,
      },
      dateClass: "text-xs flex-shrink-0 ml-2",
      dateStyle: {
        color:
          thread.unread_count && thread.unread_count > 0
            ? xiaomiColors.background.bold
            : xiaomiColors.background.elevated,
      },
      messageClass: `text-sm pr-1 truncate ${thread.unread_count && thread.unread_count > 0 ? "font-medium" : ""
        }`,
      messageStyle: {
        color:
          thread.unread_count && thread.unread_count > 0
            ? xiaomiColors.background.bold
            : xiaomiColors.background.elevated,
      },
      messageCountContainerClass: "flex items-center gap-1 ml-2 flex-shrink-0",
      messageCountIconClass: "",
      messageCountIconStyle: { color: samsungColors.text.secondary },
      messageCountTextClass:
        "text-xs text-white py-0.5 px-1.5 rounded-full bg-amber-900",
      messageCountTextStyle: {},
      phoneNumberClass: "",
      phoneNumberStyle: {},
      selectionIndicatorClass: "",
      selectionIndicatorStyle: {},
    },

    Apple: {
      containerClass: `flex items-center gap-4 p-4 w-full cursor-pointer transition-all duration-200 border-b border-gray-300 `,
      containerStyle: {
        backgroundColor: isSelected ? "#F2F2F7" : "#FFF",
      },
      avatarClass: "relative flex-shrink-0",
      avatarImgClass: "w-12 h-12 rounded-full object-cover",
      avatarDefaultClass:
        "w-12 h-12 rounded-full flex items-center justify-center text-white font-medium",
      avatarDefaultStyle: {
        background: "linear-gradient(to bottom, #A7AAB7 0%, #848991 100%)",
      },
      avatarIcon: isPhoneNumber(thread.address) ? (
        <Phone size={32} />
      ) : (
        <span className="text-xl">{getContactInitials(getContactName())}</span>
      ),
      unreadBadgeClass:
        "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold text-white",
      unreadBadgeStyle: { backgroundColor: "#ff3b30" },
      nameClass: `font-medium truncate ${thread.unread_count && thread.unread_count > 0 ? "font-semibold" : ""
        }`,
      nameStyle: { color: "#1c1c1e" },

      dateClass: "text-sm flex-shrink-0 flex items-center gap-1",
      dateStyle: { color: "rgba(60, 60, 67, 0.6)" },
      messageClass: `text-sm truncate ${thread.unread_count && thread.unread_count > 0 ? "font-medium" : ""
        }`,
      messageStyle: { color: "rgba(60, 60, 67, 0.6)" },
      messageCountContainerClass: "flex-shrink-0",
      messageCountTextClass: "text-xs font-medium",
      messageCountTextStyle: { color: "#007AFF" },
      phoneNumberClass: "text-sm mt-1",
      phoneNumberStyle: { color: "rgba(60, 60, 67, 0.6)" },
      selectionIndicatorClass: "w-1 h-8 rounded-full flex-shrink-0",
    },
  };

  const currentTheme = themeConfig[theme];

  return (
    <div
      onClick={onClick}
      className={currentTheme.containerClass}
      style={currentTheme.containerStyle}
    >
      <div className={currentTheme.avatarClass}>
        {thread.contact?.profile_image ? (
          <img
            src={thread.contact.profile_image}
            alt={getContactName()}
            className={currentTheme.avatarImgClass}
          />
        ) : (
          <div
            className={currentTheme.avatarDefaultClass}
            style={currentTheme.avatarDefaultStyle}
          >
            {currentTheme.avatarIcon}
          </div>
        )}
        {(theme === "Samsung" || theme === "Apple") &&
          thread.unread_count &&
          thread.unread_count > 0 && (
            <div
              className={currentTheme.unreadBadgeClass}
              style={currentTheme.unreadBadgeStyle}
            >
              {thread.unread_count > 99 ? "99+" : thread.unread_count}
            </div>
          )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={currentTheme.nameClass} style={currentTheme.nameStyle}>
            {searchQuery
              ? highlightSearchTerms(getContactName(), searchQuery)
              : getContactName()}
          </h3>
          <span
            className={currentTheme.dateClass}
            style={currentTheme.dateStyle}
          >
            {formatDate(thread.last_message_date)}
            {theme !== "Xiaomi" && (
              <ChevronRight size={20} className="opacity-60" />
            )}
          </span>
        </div>

        <div className="flex flex-col">
          <p
            className={currentTheme.messageClass}
            style={currentTheme.messageStyle}
          >
            {theme === "Apple"
              ? renderAppleStyledText(
                formatLastMessage(thread.last_message),
                searchQuery
              )
              : searchQuery
                ? highlightSearchTerms(
                  formatLastMessage(thread.last_message),
                  searchQuery
                )
                : formatLastMessage(thread.last_message)}
          </p>

          {theme === "Apple" && (
            <>
              {!thread.contact && isPhoneNumber(thread.address) && (
                <p
                  className={currentTheme.phoneNumberClass}
                  style={currentTheme.phoneNumberStyle}
                >
                  {thread.address}
                </p>
              )}

              <div className={currentTheme.messageCountContainerClass}>
                <span
                  className={currentTheme.messageCountTextClass}
                  style={currentTheme.messageCountTextStyle}
                >
                  {thread.messages_count || 0} Message
                  {thread.messages_count !== 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {theme === "Apple" && isSelected && (
        <div className={currentTheme.selectionIndicatorClass} />
      )}
    </div>
  );
};