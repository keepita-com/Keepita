import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import type {
  MessageThread,
  Message,
  ChatMessageFilters,
} from "../types/message.types";
import { samsungColors } from "../../../constants/samsung.constants";
import { ArrowLeft, Phone, User, Loader2, UserRound } from "lucide-react";
import { useMessageGroups } from "../hooks/message.hooks";
import { ConversationSearchAndFilter } from "./ConversationSearchAndFilter";
import { highlightSearchTerms } from "../utils/searchUtils";
import { xiaomiColors } from "@/features/backup/constants/xiaomi.constants";
import { getInitials } from "../utils/message.utils";
import twemoji from "twemoji";

type Theme = "Samsung" | "Xiaomi" | "Apple" | undefined;

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  searchQuery?: string;
  theme?: Theme;
  isGrouped?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({
    message,
    searchQuery = "",
    theme = "Samsung",
    isOutgoing,
    isGrouped = false,
  }) => {
    const formatTime = (dateString: string) =>
      new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    if (theme === "Samsung" || theme === "Xiaomi") {
      const config = {
        Samsung: {
          containerClass: `flex ${
            isOutgoing ? "justify-end" : "justify-start"
          } mb-2`,
          bubbleClass: `max-w-[75%] px-4 py-2 rounded-2xl ${
            isOutgoing ? "rounded-br-md" : "rounded-bl-md"
          }`,
          bubbleStyle: {
            backgroundColor: isOutgoing
              ? samsungColors.primary[500]
              : samsungColors.background.secondary,
            color: isOutgoing
              ? samsungColors.text.primary
              : samsungColors.text.primary,
          },
          timeClass: `flex items-center gap-1 mt-1 ${
            isOutgoing ? "justify-end" : "justify-start"
          }`,
          timeStyle: {
            color: isOutgoing
              ? samsungColors.text.primary
              : samsungColors.text.secondary,
          },
          statusDotStyle: (seen: boolean) => ({
            backgroundColor: seen
              ? samsungColors.status.success
              : samsungColors.text.primary + "60",
          }),
          statusDotStyleFn: (seen: boolean) => ({
            backgroundColor: seen
              ? samsungColors.status.success
              : samsungColors.text.primary + "60",
          }),
          textClass: "text-sm leading-relaxed whitespace-pre-wrap break-words",
          timeTextClass: "text-xs opacity-75",
        },
        Xiaomi: {
          containerClass: `flex flex-col ${
            isOutgoing ? "items-end" : "items-start"
          } mb-2`,
          bubbleClass: `max-w-[75%] px-4 py-2 rounded-lg mb-1`,
          bubbleStyle: {
            backgroundColor: isOutgoing
              ? xiaomiColors.background.emphasis
              : xiaomiColors.background.main,
            color: xiaomiColors.text.main,
          },
          timeClass: `flex items-center gap-1 mt-1 ${
            isOutgoing ? "justify-end pr-2" : "justify-start pl-2"
          }`,
          timeStyle: {
            color: isOutgoing
              ? samsungColors.text.primary
              : samsungColors.text.secondary,
          },
          statusDotStyleFn: () => ({}),
          textClass:
            "text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-words",
          timeTextClass: `text-xs text-stone-700 ${
            isOutgoing ? "pr-1.5" : "pl-1.5"
          }`,
        },
      }[theme];

      return (
        <div className={config.containerClass}>
          <div className={config.bubbleClass} style={config.bubbleStyle}>
            <p className={config.textClass}>
              {searchQuery
                ? highlightSearchTerms(message.body, searchQuery)
                : message.body}
            </p>
            <div className={config.timeClass}>
              {theme === "Samsung" && (
                <span className={config.timeTextClass} style={config.timeStyle}>
                  {formatTime(message.date)}
                </span>
              )}
              {isOutgoing && (
                <div className="flex gap-1">
                  <div
                    className="w-1 h-1 rounded-full"
                    style={config.statusDotStyleFn(message.seen)}
                  />
                  <div
                    className="w-1 h-1 rounded-full"
                    style={config.statusDotStyleFn(message.seen)}
                  />
                </div>
              )}
            </div>
          </div>
          {theme === "Xiaomi" && (
            <span className={config.timeTextClass} style={config.timeStyle}>
              {formatTime(message.date)}
            </span>
          )}
        </div>
      );
    }

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
                style:
                  "width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin: 0 0.1em; display: inline-block;",
              }),
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          })}
        </>
      );
    };

    const isEmojiOnly =
      /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*$/u.test(
        message.body.trim(),
      );
    const bubbleBg = isOutgoing ? "#007aff" : "#e5e5ea";
    const textColor = isOutgoing ? "#ffffff" : "#1c1c1e";

    const tailBefore = isOutgoing
      ? {
          borderBottomLeftRadius: "0.8rem 0.7rem",
          borderRight: `1rem solid ${bubbleBg}`,
          right: "-0.25rem",
          transform: "translate(0, -0.1rem)",
        }
      : {
          borderBottomRightRadius: "0.8rem 0.7rem",
          borderLeft: `1rem solid ${bubbleBg}`,
          left: "-0.25rem",
          transform: "translate(0, -0.1rem)",
        };

    const tailAfter = {
      backgroundColor: "#fff",
      borderBottomLeftRadius: isOutgoing ? "0.5rem" : undefined,
      borderBottomRightRadius: !isOutgoing ? "0.5rem" : undefined,
      [isOutgoing ? "right" : "left"]: isOutgoing ? "-40px" : "20px",
      transform: "translate(-30px, -2px)",
      width: "10px",
      height: "1rem",
    };

    return (
      <div
        className={`flex ${isOutgoing ? "justify-end" : "justify-start"} ${
          isGrouped ? "mt-1" : "my-2"
        }`}
      >
        <div className="relative max-w-[75%]">
          <p
            className={`inline-block px-4 py-3 rounded-[1.15rem] text-md leading-tight apple-theme-font ${
              isEmojiOnly ? "text-4xl p-0 bg-transparent" : ""
            } ${isOutgoing ? "text-right" : "text-left"}`}
            style={{
              backgroundColor: isEmojiOnly ? "transparent" : bubbleBg,
              color: textColor,
              wordWrap: "break-word",
              position: "relative",
            }}
          >
            {searchQuery
              ? theme === "Apple"
                ? renderAppleStyledText(message.body, searchQuery)
                : highlightSearchTerms(message.body, searchQuery)
              : theme === "Apple"
                ? renderAppleStyledText(message.body, "")
                : message.body}

            {!isEmojiOnly && (
              <span
                className="absolute bottom-0 h-4"
                style={{
                  ...tailBefore,
                  content: '""',
                  position: "absolute",
                }}
              />
            )}

            {!isEmojiOnly && (
              <span
                className="absolute bottom-0 h-4"
                style={{
                  ...tailAfter,
                  content: '""',
                  position: "absolute",
                }}
              />
            )}
          </p>

          <div
            className={`text-xs mt-1 flex items-center gap-1 ${
              isOutgoing ? "justify-end pr-1" : "justify-start pl-1"
            }`}
            style={{ color: "#8e8e93" }}
          >
            {formatTime(message.date)}
          </div>
        </div>
      </div>
    );
  },
);

interface DateSeparatorProps {
  date: string;
  theme?: Theme;
}

const DateSeparator: React.FC<DateSeparatorProps> = memo(
  ({ date, theme = "Samsung" }) => {
    const formatDate = useMemo(() => {
      const formatter = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return (d: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return "Today";
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        return formatter.format(d);
      };
    }, []);

    const bgColor =
      theme === "Apple" ? "#fff" : samsungColors.background.secondary;
    const textColor =
      theme === "Apple" ? "#8e8e93" : samsungColors.text.secondary;

    return (
      <div className="flex items-center justify-center my-4">
        <div
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {formatDate(new Date(date))}
        </div>
      </div>
    );
  },
);

interface MessageConversationProps {
  thread: MessageThread;
  messages: Message[];
  loading?: boolean;
  onBack: () => void;
  onMessageSearch?: (query: string) => void;
  onMessageFiltersChange?: (filters: ChatMessageFilters) => void;
  messageFilters?: ChatMessageFilters;
  messageSearchQuery?: string;
  onClearAllFilters?: () => void;
  theme?: Theme;
}

export const MessageConversation: React.FC<MessageConversationProps> = ({
  thread,
  messages,
  loading = false,
  onBack,
  onMessageSearch,
  onMessageFiltersChange,
  messageFilters = {},
  messageSearchQuery = "",
  onClearAllFilters,
  theme = "Samsung",
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageGroups = useMessageGroups(messages);
  const [messageSortConfig, setMessageSortConfig] = useState({
    field: "date",
    direction: "asc" as "asc" | "desc",
  });
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const initials = useMemo(
    () =>
      thread.contact?.display_name
        ? getInitials(thread.contact.display_name)
        : null,
    [thread.contact?.display_name],
  );

  const isPhoneNumber = (address: string) => /^\+?\d[\d\s\-()]+$/.test(address);

  const themeConfig = {
    Samsung: {
      containerStyle: { backgroundColor: samsungColors.background.primary },
      headerStyle: { backgroundColor: samsungColors.background.secondary },
      headerTextColor: samsungColors.text.primary,
      headerSecondaryColor: samsungColors.text.secondary,
      avatarStyle: { backgroundColor: samsungColors.primary[500] },
      avatarIcon: isPhoneNumber(thread.address) ? (
        <Phone size={16} />
      ) : (
        <User size={16} />
      ),
      moreVerticalColor: samsungColors.text.secondary,
      loaderColor: samsungColors.primary[500],
      noMessagesColor: samsungColors.text.secondary,
      filterTheme: undefined,
      dateSeparatorTheme: "Samsung",
      messageBubbleTheme: "Samsung",
      footerBg: samsungColors.background.secondary,
      footerBorder: samsungColors.border.light,
    },
    Xiaomi: {
      containerStyle: { backgroundColor: xiaomiColors.background.secondary },
      headerStyle: { backgroundColor: xiaomiColors.background.main },
      headerTextColor: xiaomiColors.text.main,
      headerSecondaryColor: xiaomiColors.text.main,
      avatarStyle: { backgroundColor: xiaomiColors.background.elevated },
      avatarIcon: initials ? (
        <span className="text-white text-sm font-medium">{initials}</span>
      ) : (
        <UserRound size={20} />
      ),
      moreVerticalColor: samsungColors.text.secondary,
      loaderColor: samsungColors.primary[500],
      noMessagesColor: samsungColors.text.secondary,
      filterTheme: "Xiaomi",
      dateSeparatorTheme: "Xiaomi",
      messageBubbleTheme: "Xiaomi",
      footerBg: xiaomiColors.background.secondary,
      footerBorder: xiaomiColors.border.main,
    },
    Apple: {
      containerStyle: { backgroundColor: "#fff" },
      headerStyle: { backgroundColor: "#F5F5F5" },
      headerTextColor: "#1c1c1e",
      headerSecondaryColor: "#8e8e93",
      avatarStyle: {
        background: "linear-gradient(to bottom, #A7AAB7 0%, #848991 100%)",
      },
      avatarIcon: isPhoneNumber(thread.address) ? (
        <Phone size={46} />
      ) : (
        <User size={52} />
      ),
      moreVerticalColor: "#8e8e93",
      loaderColor: "#007aff",
      noMessagesColor: "#8e8e93",
      filterTheme: "Apple",
      dateSeparatorTheme: "Apple",
      messageBubbleTheme: "Apple",
      footerBg: "#f2f2f7",
      footerBorder: "#c6c6c8",
    },
  };

  const currentTheme = themeConfig[theme];

  const activeFiltersCount = Object.keys(messageFilters).filter(
    (key) =>
      key !== "page" &&
      key !== "page_size" &&
      key !== "ordering" &&
      messageFilters[key as keyof ChatMessageFilters] !== undefined,
  ).length;

  const handleMessageFiltersChange = (filters: ChatMessageFilters) => {
    onMessageFiltersChange?.(filters);
  };

  const handleMessageSortChange = (sortConfig: {
    field: string;
    direction: "asc" | "desc";
  }) => {
    setMessageSortConfig(sortConfig);
    const ordering =
      sortConfig.direction === "desc"
        ? `-${sortConfig.field}`
        : sortConfig.field;
    onMessageFiltersChange?.({ ...messageFilters, ordering });
  };

  useEffect(() => {
    setHasInitiallyLoaded(false);
  }, [thread.id]);

  useEffect(() => {
    if (!messagesEndRef.current || messages.length === 0) return;

    const timer = setTimeout(
      () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setHasInitiallyLoaded(true);
      },
      hasInitiallyLoaded ? 0 : 500,
    );

    return () => clearTimeout(timer);
  }, [messages.length, hasInitiallyLoaded]);

  const getContactName = () =>
    thread.contact?.display_name || thread.contact?.name || thread.address;

  return (
    <div className="flex flex-col h-full" style={currentTheme.containerStyle}>
      <div
        className={`relative flex-shrink-0 px-4 border-b ${
          theme === "Apple"
            ? "py-4 flex flex-col items-center justify-center"
            : "py-3 flex items-center gap-3"
        }`}
        style={currentTheme.headerStyle}
      >
        {theme !== "Apple" && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-black hover:bg-opacity-5 transition-colors"
            style={{ color: currentTheme.headerTextColor }}
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {thread.contact?.profile_image ? (
          <img
            src={thread.contact.profile_image}
            alt={getContactName()}
            className={`${
              theme === "Apple" ? "w-16 h-16 mb-2" : "w-10 h-10"
            } rounded-full object-cover ${
              theme !== "Apple" ? "flex-shrink-0" : ""
            }`}
          />
        ) : (
          <div
            className={`rounded-full flex items-center justify-center text-white font-medium ${
              theme === "Apple"
                ? "w-16 h-16 mb-2"
                : theme === "Samsung"
                  ? "w-10 h-10"
                  : "w-12 h-12"
            } ${theme !== "Apple" ? "flex-shrink-0" : ""}`}
            style={currentTheme.avatarStyle}
          >
            {currentTheme.avatarIcon}
          </div>
        )}

        {theme === "Apple" ? (
          <div className="flex flex-col items-center">
            <h2
              className="font-semibold text-base truncate max-w-full"
              style={{ color: currentTheme.headerTextColor }}
              title={getContactName()}
            >
              {getContactName()}
            </h2>
            <p
              className="text-xs mt-1"
              style={{ color: currentTheme.headerSecondaryColor }}
            >
              {thread.messages_count} messages
            </p>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <h2
              className="font-semibold truncate"
              style={{ color: currentTheme.headerTextColor }}
              title={getContactName()}
            >
              {getContactName()}
            </h2>
            <p
              className="text-sm"
              style={{ color: currentTheme.headerSecondaryColor }}
            >
              {thread.messages_count} messages
            </p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <ConversationSearchAndFilter
          searchQuery={messageSearchQuery}
          onSearchChange={onMessageSearch || (() => {})}
          filters={messageFilters}
          onFiltersChange={handleMessageFiltersChange}
          sortConfig={messageSortConfig}
          onSortChange={handleMessageSortChange}
          activeFiltersCount={activeFiltersCount}
          onClearAllFilters={onClearAllFilters}
          theme={currentTheme.filterTheme as "Samsung" | "Xiaomi" | "Apple"}
        />
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col-reverse"
        style={{ minHeight: 0 }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: currentTheme.loaderColor }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: currentTheme.noMessagesColor }}>
              No messages found in this conversation
            </p>
          </div>
        ) : (
          <>
            <div ref={messagesEndRef} />
            {[...messageGroups].reverse().map((group) => (
              <div key={group.date}>
                <DateSeparator
                  date={group.date}
                  theme={currentTheme.dateSeparatorTheme as Theme}
                />
                {group.messages.map((message, idx, arr) => {
                  const prev = arr[idx - 1];
                  const timeDiff = prev
                    ? Math.abs(
                        new Date(message.date).getTime() -
                          new Date(prev.date).getTime(),
                      )
                    : Infinity;
                  const isGrouped =
                    idx > 0 &&
                    prev?.status === message.status &&
                    prev?.seen === message.seen &&
                    timeDiff < 60_000;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOutgoing={message.status === 0}
                      searchQuery={messageSearchQuery}
                      theme={currentTheme.messageBubbleTheme as Theme}
                      isGrouped={isGrouped}
                    />
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>

      <div
        className="flex-shrink-0 px-4 py-2 text-center border-t"
        style={{
          backgroundColor: currentTheme.footerBg,
          borderColor: currentTheme.footerBorder,
        }}
      >
        <p
          className="text-xs"
          style={{
            color: theme === "Apple" ? "#8e8e93" : samsungColors.text.secondary,
          }}
        >
          Messages from backup •
          {new Date(thread.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
