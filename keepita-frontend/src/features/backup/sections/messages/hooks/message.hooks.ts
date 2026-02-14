import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMessageStore } from "../store/message.store";
import { getMessageThreads, getMessageThread } from "../api/message.api";
import type {
  MessageFilters,
  ChatListFilters,
  ChatMessageFilters,
  Message,
  MessageThreadsResponse,
} from "../types/message.types";

interface UseInfiniteScrollOptions {
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  threshold = 0.1,
  rootMargin = "50px",
}: UseInfiniteScrollOptions) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = loadMoreRef.current;

    if (!currentRef || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, threshold, rootMargin]);

  return { loadMoreRef };
};

export const useMessageThreads = (backupId: number) => {
  const { chatListFilters } = useMessageStore();

  const buildParams = useCallback(() => {
    return {
      page_size: 20,
      ...chatListFilters,
      ordering: chatListFilters.ordering || "-created_at",
    };
  }, [chatListFilters]);

  const queryKey = useMemo(
    () => ["messageThreads", backupId, buildParams()],
    [backupId, buildParams],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
    refetch,
  } = useInfiniteQuery<MessageThreadsResponse>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      getMessageThreads(backupId, pageParam as number, buildParams()),
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.current_page + 1 : undefined;
    },
    enabled: !!backupId,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
  });

  const threads = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.results || []);
  }, [data?.pages]);

  const totalCount = useMemo(() => {
    return data?.pages?.[0]?.total_results || 0;
  }, [data?.pages]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    threads,
    totalCount,
    loading: isFetching && !isFetchingNextPage,
    loadingMore: isFetchingNextPage,
    error: error ? (error as Error).message : null,
    hasMore: hasNextPage,
    loadMore,
    refresh,
  };
};

export const useThreadMessages = (
  backupId: number,
  threadId: number | null,
) => {
  const { chatMessageFilters } = useMessageStore();

  const buildParams = useCallback(() => {
    return {
      ...chatMessageFilters,
      ordering: chatMessageFilters.ordering || "date",
    };
  }, [chatMessageFilters]);

  const queryKey = useMemo(
    () => ["threadMessages", backupId, threadId, buildParams()],
    [backupId, threadId, buildParams],
  );

  const {
    data: threadWithMessages,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => {
      if (!threadId) throw new Error("Thread ID is required");
      return getMessageThread(backupId, threadId, buildParams());
    },
    enabled: !!backupId && !!threadId,
    staleTime: 1000 * 60 * 2,
  });

  const messages = useMemo(() => {
    return threadWithMessages?.messages || [];
  }, [threadWithMessages?.messages]);

  const currentThread = useMemo(() => {
    return threadWithMessages?.thread || null;
  }, [threadWithMessages?.thread]);

  return {
    messages,
    currentThread,
    loading: isFetching,
    error: error ? (error as Error).message : null,
    refresh: refetch,
  };
};

export const useMessageFilters = () => {
  const {
    chatListFilters,
    chatMessageFilters,
    filters,
    setChatListFilters,
    setChatMessageFilters,
    setFilters,
    clearAllFilters,
  } = useMessageStore();

  const updateChatListFilters = useCallback(
    (newFilters: Partial<ChatListFilters>) => {
      setChatListFilters(newFilters);
    },
    [setChatListFilters],
  );

  const updateChatMessageFilters = useCallback(
    (newFilters: Partial<ChatMessageFilters>) => {
      setChatMessageFilters(newFilters);
    },
    [setChatMessageFilters],
  );

  const updateFilters = useCallback(
    (newFilters: Partial<MessageFilters>) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  const clearFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  const setSearch = useCallback(
    (search: string) => {
      setChatListFilters({ search });
    },
    [setChatListFilters],
  );

  const setUnreadOnly = useCallback(
    (unreadOnly: boolean) => {
      setChatListFilters({ has_unread: unreadOnly });
    },
    [setChatListFilters],
  );

  const setSorting = useCallback(
    (ordering: string) => {
      setChatListFilters({ ordering });
    },
    [setChatListFilters],
  );

  return {
    chatListFilters,
    chatMessageFilters,
    filters,

    updateChatListFilters,
    updateChatMessageFilters,
    updateFilters,
    clearFilters,

    setSearch,
    setUnreadOnly,
    setSorting,
  };
};

export const useMessageUI = () => {
  const {
    selectedThreadId,
    selectedMessageIds,
    viewMode,
    sortBy,
    groupBy,
    isConversationOpen,
    setSelectedThreadId,
    setSelectedMessageIds,
    toggleMessageSelection,
    clearMessageSelection,
    setViewMode,
    setSortBy,
    setGroupBy,
    setConversationOpen,
  } = useMessageStore();

  const selectThread = useCallback(
    (threadId: number | null) => {
      setSelectedThreadId(threadId);
      setConversationOpen(!!threadId);
    },
    [setSelectedThreadId, setConversationOpen],
  );

  const selectMessages = useCallback(
    (messageIds: number[]) => {
      setSelectedMessageIds(messageIds);
    },
    [setSelectedMessageIds],
  );

  const toggleMessage = useCallback(
    (messageId: number) => {
      toggleMessageSelection(messageId);
    },
    [toggleMessageSelection],
  );

  const clearSelections = useCallback(() => {
    clearMessageSelection();
  }, [clearMessageSelection]);

  const closeConversation = useCallback(() => {
    setSelectedThreadId(null);
    setConversationOpen(false);
  }, [setSelectedThreadId, setConversationOpen]);

  return {
    selectedThreadId,
    selectedMessageIds,

    viewMode,
    sortBy,
    groupBy,
    isConversationOpen,

    selectThread,
    selectMessages,
    toggleMessage,
    clearSelections,
    closeConversation,

    setViewMode,
    setSortBy,
    setGroupBy,
  };
};

export const useMessageGroups = (messages: Message[]) => {
  return useMemo(() => {
    const groups: { [date: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups)
      .map(([date, msgs]) => ({
        date,
        messages: msgs.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [messages]);
};
