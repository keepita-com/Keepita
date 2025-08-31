import React, { useEffect, useRef, useState } from "react";
import type {
  MessageThread,
  Message,
  ChatMessageFilters,
} from "../types/message.types";
import { samsungColors } from "../../../constants/samsung.constants";
import { ArrowLeft, Phone, User, MoreVertical, Loader2 } from "lucide-react";
import { useMessageGroups } from "../hooks/message.hooks";
import { ConversationSearchAndFilter } from "./ConversationSearchAndFilter";
import { highlightSearchTerms } from "../utils/searchUtils";

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  searchQuery?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOutgoing,
  searchQuery = "",
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
          isOutgoing ? "rounded-br-md" : "rounded-bl-md"
        }`}
        style={{
          backgroundColor: isOutgoing
            ? samsungColors.primary[500]
            : samsungColors.background.secondary,
          color: isOutgoing
            ? samsungColors.text.primary
            : samsungColors.text.primary,
        }}
      >
        {" "}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {searchQuery
            ? highlightSearchTerms(message.body, searchQuery)
            : message.body}
        </p>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOutgoing ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className="text-xs opacity-75"
            style={{
              color: isOutgoing
                ? samsungColors.text.primary
                : samsungColors.text.secondary,
            }}
          >
            {formatTime(message.date)}
          </span>{" "}
          {isOutgoing && (
            <div className="flex gap-1">
              <div
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: message.seen
                    ? samsungColors.status.success
                    : samsungColors.text.primary + "60",
                }}
              />
              <div
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: message.seen
                    ? samsungColors.status.success
                    : samsungColors.text.primary + "60",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const formatDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: samsungColors.background.secondary,
          color: samsungColors.text.secondary,
        }}
      >
        {formatDate(date)}
      </div>
    </div>
  );
};

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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageGroups = useMessageGroups(messages);
  const [messageSortConfig, setMessageSortConfig] = useState({
    field: "date",
    direction: "asc" as "asc" | "desc",
  });

  // Handle advanced search and filtering
  const handleMessageFiltersChange = (filters: ChatMessageFilters) => {
    onMessageFiltersChange?.(filters);
  };

  const handleMessageSortChange = (sortConfig: {
    field: string;
    direction: "asc" | "desc";
  }) => {
    setMessageSortConfig(sortConfig);
    // Update the ordering in filters
    const ordering =
      sortConfig.direction === "desc"
        ? `-${sortConfig.field}`
        : sortConfig.field;
    onMessageFiltersChange?.({
      ...messageFilters,
      ordering,
    });
  };

  // Calculate active filters count
  const activeFiltersCount = Object.keys(messageFilters).filter(
    (key) =>
      key !== "page" &&
      key !== "page_size" &&
      key !== "ordering" &&
      messageFilters[key as keyof ChatMessageFilters] !== undefined
  ).length; // Prevent auto-scroll to bottom when opening a chat - only scroll for new messages
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Reset initial load state when thread changes
  useEffect(() => {
    setHasInitiallyLoaded(false);
  }, [thread.id]);

  useEffect(() => {
    // Mark as initially loaded after first render with a delay to allow layout to settle
    if (messages.length > 0 && !hasInitiallyLoaded) {
      setTimeout(() => {
        setHasInitiallyLoaded(true);
        // Only scroll to bottom if there are many messages (indicating it's a real conversation)
        // and use a gentle scroll
        if (messages.length > 5 && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        }
      }, 500);
    }
  }, [messages.length, hasInitiallyLoaded]);

  // Don't auto-scroll for new messages unless user is near bottom
  useEffect(() => {
    if (
      messagesEndRef.current &&
      hasInitiallyLoaded &&
      messages.length > 0 &&
      scrollContainerRef.current
    ) {
      const container = scrollContainerRef.current;
      const isNearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 100;

      // Only auto-scroll if user is near the bottom (within 100px)
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }
  }, [messages.length, hasInitiallyLoaded]);

  const getContactName = () => {
    if (thread.contact?.display_name) return thread.contact.display_name;
    if (thread.contact?.name) return thread.contact.name;
    return thread.address;
  };

  const isPhoneNumber = (address: string) => {
    return /^\+?\d[\d\s\-\(\)]+$/.test(address);
  };
  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: samsungColors.background.primary }}
    >
      {" "}
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3 border-b flex items-center gap-3"
        style={{
          backgroundColor: samsungColors.background.secondary,
          borderColor: samsungColors.border.light,
        }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
          style={{ color: samsungColors.text.primary }}
        >
          <ArrowLeft size={20} />
        </button>
        {/* Contact Avatar */}
        {thread.contact?.profile_image ? (
          <img
            src={thread.contact.profile_image}
            alt={getContactName()}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: samsungColors.primary[500] }}
          >
            {isPhoneNumber(thread.address) ? (
              <Phone size={16} />
            ) : (
              <User size={16} />
            )}
          </div>
        )}
        <div className="flex-1">
          <h2
            className="font-semibold"
            style={{ color: samsungColors.text.primary }}
          >
            {getContactName()}
          </h2>
          <p
            className="text-sm"
            style={{ color: samsungColors.text.secondary }}
          >
            {thread.messages_count} messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ color: samsungColors.text.secondary }}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>{" "}
      {/* Advanced Search and Filter Bar */}
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
        />
      </div>
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{
          minHeight: 0,
        }}
      >
        {" "}
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: samsungColors.primary[500] }}
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p style={{ color: samsungColors.text.secondary }}>
                No messages found in this conversation
              </p>
            </div>
          </div>
        ) : (
          <>
            {messageGroups.map((group) => (
              <div key={group.date}>
                <DateSeparator date={group.date} />{" "}
                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOutgoing={message.status === 0}
                    searchQuery={messageSearchQuery}
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      {/* Samsung-style footer info */}
      <div
        className="flex-shrink-0 px-4 py-2 text-center border-t"
        style={{
          backgroundColor: samsungColors.background.secondary,
          borderColor: samsungColors.border.light,
        }}
      >
        <p className="text-xs" style={{ color: samsungColors.text.secondary }}>
          Messages from backup •{" "}
          {new Date(thread.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
