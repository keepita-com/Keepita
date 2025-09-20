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
import SamsungSearchAndFilterHeader from "../../../../../shared/components/SamsungSearchAndFilterHeader";
import { MESSAGE_SORT_OPTIONS_FOR_HEADER } from "../constants/message.constants";

interface MessageSortConfig {
  field: string;
  direction: "asc" | "desc";
}

export const MessagesPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  useDocumentTitle("Messages | xplorta");
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<MessageSortConfig>({
    field: "date",
    direction: "desc",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Hooks for data management
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
  } = useMessageFilters(); // Handle thread selection
  const handleThreadSelect = useCallback((thread: MessageThread) => {
    setSelectedThread(thread);
  }, []);

  // Handle back navigation (for mobile)
  const handleBack = useCallback(() => {
    setSelectedThread(null);
  }, []);

  // Handle search
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateChatListFilters({
        ...chatListFilters,
        search: query || undefined,
      });
    },
    [chatListFilters, updateChatListFilters]
  );

  // Handle filters change
  const handleFiltersChange = useCallback(
    (newFilters: ChatListFilters) => {
      updateChatListFilters(newFilters);
    },
    [updateChatListFilters]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSortConfig: MessageSortConfig) => {
      setSortConfig(newSortConfig);
      // Convert to backend ordering format
      const ordering =
        newSortConfig.direction === "desc"
          ? `-${newSortConfig.field}`
          : newSortConfig.field;
      updateChatListFilters({
        ...chatListFilters,
        ordering,
      });
    },
    [chatListFilters, updateChatListFilters]
  );

  // Handle message search
  const handleMessageSearch = useCallback(
    (query: string) => {
      updateChatMessageFilters({
        ...chatMessageFilters,
        search: query || undefined,
      });
    },
    [chatMessageFilters, updateChatMessageFilters]
  );

  // Handle message filters change
  const handleMessageFiltersChange = useCallback(
    (newFilters: ChatMessageFilters) => {
      updateChatMessageFilters(newFilters);
    },
    [updateChatMessageFilters]
  );

  // Calculate subtitle with thread count from total_results
  const subtitle = totalCount > 0 ? `${totalCount} conversations` : undefined;

  // Check if there are active filters
  const hasActiveFilters = Object.keys(chatListFilters).some(
    (key) =>
      key !== "ordering" &&
      chatListFilters[key as keyof ChatListFilters] !== undefined
  );
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel - Always visible on desktop, toggleable on mobile */}
      <div
        className={`${
          selectedThread ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-[400px] lg:w-[500px] min-w-0 border-r border-gray-200`}
      >
        <SamsungSectionLayout
          title="Messages"
          subtitle={subtitle}
          onBack={() => navigate(`/backups/${backupId}`)}
          isLoading={threadsLoading}
        >
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
              <SamsungSearchAndFilterHeader
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search conversations..."
                filters={chatListFilters}
                onFiltersChange={handleFiltersChange}
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
                  />
                }
              />
            </div>
            <div className="flex-1 min-h-0 h-0 overflow-hidden">
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
              />
            </div>
          </div>
        </SamsungSectionLayout>
      </div>
      {/* Right Panel - Always visible on desktop */}
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
                  className="text-gray-500"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Select a conversation
              </h2>
              <p className="text-sm max-w-sm text-gray-600">
                Choose a conversation from the list to view and manage your
                messages with Samsung One UI style interface.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
