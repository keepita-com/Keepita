import React, { useCallback, useState } from "react";
import {
  useMessageFilters,
  useMessageThreads,
  useThreadMessages,
} from "../hooks/message.hooks";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import type {
  ChatListFilters,
  ChatMessageFilters,
  MessageThread,
} from "../types/message.types";
import {
  MessageConversation,
  MessageList,
  AdvancedMessageFilters,
} from "../components";
import { useNavigate, useParams } from "react-router-dom";
import SamsungSectionLayout from "../../../../../shared/components/SamsungSectionLayout";
import XiaomiSectionLayout from "@/shared/components/XiaomiSectionLayout";
import AppleSectionLayout from "@/shared/components/AppleSectionLayout";
import { MESSAGE_SORT_OPTIONS_FOR_HEADER } from "../constants/message.constants";
import MobileSearchAndFilterHeader from "@/shared/components/MobileSearchAndFilterHeader";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

interface MessageSortConfig {
  field: string;
  direction: "asc" | "desc";
}

export const MessagesPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const { theme } = useBackupTheme();
  const navigate = useNavigate();
  useDocumentTitle("Messages | Keepita");

  const {
    backup,
    isLoading: isBackupLoading,
    error: backupError,
  } = useBackupDetails(backupId);

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<MessageSortConfig>({
    field: "created_at",
    direction: "desc",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    threads,
    totalCount,
    loading: threadsLoading,
    hasMore,
    loadingMore: isLoadingMore,
    loadMore,
  } = useMessageThreads(Number(backupId));

  const {
    messages,
    currentThread,
    loading: messagesLoading,
  } = useThreadMessages(Number(backupId), selectedThread?.id || null);

  const {
    chatListFilters,
    chatMessageFilters,
    updateChatListFilters,
    updateChatMessageFilters,
    clearFilters,
  } = useMessageFilters();

  const booleanFilters: Record<string, boolean | undefined> = {
    is_favorite_contact: chatListFilters.is_favorite_contact,
    has_messages: chatListFilters.has_messages,
    has_unread: chatListFilters.has_unread,
  };

  const handleThreadSelect = useCallback((thread: MessageThread) => {
    setSelectedThread(thread);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedThread(null);
  }, []);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateChatListFilters({
        ...chatListFilters,
        search: query || undefined,
      });
    },
    [chatListFilters, updateChatListFilters],
  );

  const handleFiltersChange = useCallback(
    (newFilters: ChatListFilters) => {
      updateChatListFilters(newFilters);
    },
    [updateChatListFilters],
  );

  const handleSortChange = useCallback(
    (newSortConfig: MessageSortConfig) => {
      setSortConfig(newSortConfig);
      const ordering =
        newSortConfig.direction === "desc"
          ? `-${newSortConfig.field}`
          : newSortConfig.field;
      updateChatListFilters({
        ...chatListFilters,
        ordering,
      });
    },
    [chatListFilters, updateChatListFilters],
  );

  const handleMessageSearch = useCallback(
    (query: string) => {
      updateChatMessageFilters({
        ...chatMessageFilters,
        search: query || undefined,
      });
    },
    [chatMessageFilters, updateChatMessageFilters],
  );

  const handleMessageFiltersChange = useCallback(
    (newFilters: ChatMessageFilters) => {
      updateChatMessageFilters(newFilters);
    },
    [updateChatMessageFilters],
  );

  const subtitle = totalCount > 0 ? `${totalCount} conversations` : undefined;

  const hasActiveFilters = Object.keys(chatListFilters).some(
    (key) =>
      key !== "ordering" &&
      chatListFilters[key as keyof ChatListFilters] !== undefined,
  );

  const themeClasses = {
    Samsung: {
      SectionLayout: SamsungSectionLayout,
      filterTheme: "Samsung" as const,
      searchInputBackgroundColor: "",
      messageListTheme: undefined,
      isClearFilterRender: undefined,
    },
    Xiaomi: {
      SectionLayout: XiaomiSectionLayout,
      filterTheme: "Xiaomi" as const,
      searchInputBackgroundColor: "bg-gray-100",
      messageListTheme: "Xiaomi" as const,
      isClearFilterRender: true,
    },
    Apple: {
      SectionLayout: AppleSectionLayout,
      filterTheme: "Apple" as const,
      searchInputBackgroundColor: "",
      messageListTheme: "Apple" as const,
      isClearFilterRender: undefined,
    },
  };

  const currentTheme = themeClasses[theme as "Samsung" | "Xiaomi" | "Apple"];

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`${
          selectedThread ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-[400px] lg:w-[500px] min-w-0 border-r border-gray-200`}
      >
        <currentTheme.SectionLayout
          title="Messages"
          subtitle={subtitle}
          onBack={() => navigate(`/backups/${backupId}`)}
        >
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
              <MobileSearchAndFilterHeader
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search conversations..."
                filters={booleanFilters}
                onFiltersChange={(newFilters) =>
                  handleFiltersChange({ ...chatListFilters, ...newFilters })
                }
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                sortConfig={sortConfig}
                onSortChange={handleSortChange}
                sortOptions={MESSAGE_SORT_OPTIONS_FOR_HEADER}
                resultsCount={totalCount}
                resultsLabel="conversations"
                customFilterElements={
                  <AdvancedMessageFilters
                    filters={chatListFilters}
                    onFiltersChange={handleFiltersChange}
                    isOpen={showAdvancedFilters}
                    onToggle={() =>
                      setShowAdvancedFilters(!showAdvancedFilters)
                    }
                    theme={currentTheme.filterTheme}
                  />
                }
                theme={currentTheme.filterTheme}
                searchInputBackgroundColor={
                  currentTheme.searchInputBackgroundColor
                }
                isClearFilterRender={currentTheme.isClearFilterRender}
              />
            </div>
            <div className="flex-1 min-h-0 h-0 overflow-hidden relative">
              {threadsLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <MessageList
                threads={threads}
                loading={threadsLoading}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
                onThreadSelect={handleThreadSelect}
                selectedThreadId={selectedThread?.id}
                searchQuery={searchQuery}
                emptyMessage={
                  searchQuery
                    ? `No conversations found for "${searchQuery}"`
                    : "No message conversations found"
                }
                theme={currentTheme.messageListTheme}
              />
            </div>
          </div>
        </currentTheme.SectionLayout>
      </div>

      <div
        className={`${
          selectedThread ? "flex" : "hidden md:flex"
        } flex-col flex-1 min-w-0 h-full`}
      >
        {selectedThread ? (
          <MessageConversation
            thread={currentThread || selectedThread}
            messages={messages}
            loading={messagesLoading}
            onBack={handleBack}
            onMessageSearch={handleMessageSearch}
            onMessageFiltersChange={handleMessageFiltersChange}
            messageFilters={chatMessageFilters}
            messageSearchQuery={chatMessageFilters.search || ""}
            onClearAllFilters={clearFilters}
            theme={theme as "Samsung" | "Xiaomi" | "Apple"}
          />
        ) : (
          <div className="flex flex-col h-full p-8 bg-gray-50">
            <div className="flex flex-col items-center text-center pt-4 my-auto">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-gray-200">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`${
                    theme === "Samsung" ? "text-gray-500" : "text-stone-700"
                  }`}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Select a conversation
              </h2>
              <p className="text-sm max-w-sm text-gray-600">
                Choose a conversation from the list to view and manage your
                messages with {theme} UI style interface.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
