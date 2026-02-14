import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  MessageFilters,
  ChatListFilters,
  ChatMessageFilters,
} from "../types/message.types";

interface MessageClientState {
  selectedThreadId: number | null;
  selectedMessageIds: number[];

  chatListFilters: ChatListFilters;
  chatMessageFilters: ChatMessageFilters;
  filters: MessageFilters;

  viewMode: "list" | "grid";
  sortBy: string;
  groupBy: "date" | "contact" | "none";

  isConversationOpen: boolean;

  setSelectedThreadId: (threadId: number | null) => void;
  setSelectedMessageIds: (messageIds: number[]) => void;
  toggleMessageSelection: (messageId: number) => void;
  clearMessageSelection: () => void;

  setChatListFilters: (filters: Partial<ChatListFilters>) => void;
  setChatMessageFilters: (filters: Partial<ChatMessageFilters>) => void;
  setFilters: (filters: Partial<MessageFilters>) => void;
  clearAllFilters: () => void;

  setViewMode: (mode: "list" | "grid") => void;
  setSortBy: (sortBy: string) => void;
  setGroupBy: (groupBy: "date" | "contact" | "none") => void;

  setConversationOpen: (open: boolean) => void;
}

export const useMessageStore = create<MessageClientState>()(
  devtools(
    (set) => ({
      selectedThreadId: null,
      selectedMessageIds: [],
      chatListFilters: {},
      chatMessageFilters: {},
      filters: {},
      viewMode: "list",
      sortBy: "-created_at",
      groupBy: "date",
      isConversationOpen: false,

      setSelectedThreadId: (threadId) =>
        set({ selectedThreadId: threadId }, false, "setSelectedThreadId"),

      setSelectedMessageIds: (messageIds) =>
        set({ selectedMessageIds: messageIds }, false, "setSelectedMessageIds"),

      toggleMessageSelection: (messageId) =>
        set(
          (state) => ({
            selectedMessageIds: state.selectedMessageIds.includes(messageId)
              ? state.selectedMessageIds.filter((id) => id !== messageId)
              : [...state.selectedMessageIds, messageId],
          }),
          false,
          "toggleMessageSelection",
        ),

      clearMessageSelection: () =>
        set({ selectedMessageIds: [] }, false, "clearMessageSelection"),

      setChatListFilters: (newFilters) =>
        set(
          (state) => {
            const updatedFilters = { ...state.chatListFilters, ...newFilters };

            Object.keys(newFilters).forEach((key) => {
              if (newFilters[key as keyof ChatListFilters] === undefined) {
                delete updatedFilters[key as keyof ChatListFilters];
              }
            });

            return { chatListFilters: updatedFilters };
          },
          false,
          "setChatListFilters",
        ),

      setChatMessageFilters: (newFilters) =>
        set(
          (state) => {
            const updatedFilters = {
              ...state.chatMessageFilters,
              ...newFilters,
            };

            Object.keys(newFilters).forEach((key) => {
              if (newFilters[key as keyof ChatMessageFilters] === undefined) {
                delete updatedFilters[key as keyof ChatMessageFilters];
              }
            });

            return { chatMessageFilters: updatedFilters };
          },
          false,
          "setChatMessageFilters",
        ),

      setFilters: (newFilters) =>
        set(
          (state) => {
            const updatedFilters = { ...state.filters, ...newFilters };

            Object.keys(newFilters).forEach((key) => {
              if (newFilters[key as keyof MessageFilters] === undefined) {
                delete updatedFilters[key as keyof MessageFilters];
              }
            });

            return { filters: updatedFilters };
          },
          false,
          "setFilters",
        ),

      clearAllFilters: () =>
        set(
          {
            chatListFilters: {},
            chatMessageFilters: {},
            filters: {},
          },
          false,
          "clearAllFilters",
        ),

      setViewMode: (mode) => set({ viewMode: mode }, false, "setViewMode"),

      setSortBy: (sortBy) => set({ sortBy }, false, "setSortBy"),

      setGroupBy: (groupBy) => set({ groupBy }, false, "setGroupBy"),

      setConversationOpen: (open) =>
        set({ isConversationOpen: open }, false, "setConversationOpen"),
    }),
    {
      name: "message-client-store",
    },
  ),
);
