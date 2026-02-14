import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo } from "react";
import type { ApiResponseList } from "../../../../../core/types/apiResponse";
import { getContacts } from "../api/contact.api";
import { useContactStore } from "../store/contact.store";
import type {
  Contact,
  GetContactsParams,
  ContactStats,
} from "../types/contact.types";

export const useContactList = (
  backupId: string | number,
  params?: GetContactsParams,
) => {
  const query = useQuery({
    queryKey: ["contacts", backupId, params],
    queryFn: async () => {
      const response = await getContacts(Number(backupId), params);
      return response;
    },
    enabled: !!backupId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    contacts: query.data?.results || [],
    pagination: query.data
      ? {
          currentPage: query.data.current_page,
          totalPages: query.data.total_pages,
          totalResults: query.data.total_results,
          hasNext: query.data.has_next,
          hasPrevious: query.data.has_previous,
          resultCount: query.data.result_count,
        }
      : null,
  };
};

export const useContactInfiniteList = (
  backupId: string | number,
  params?: GetContactsParams,
) => {
  return useInfiniteQuery({
    queryKey: ["contacts", "infinite", backupId, params],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const response = await getContacts(Number(backupId), {
        ...params,
        page: pageParam,
      });
      return response;
    },
    enabled: !!backupId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    getNextPageParam: (lastPage: ApiResponseList<Contact[]>) => {
      return lastPage.has_next ? lastPage.current_page + 1 : undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useContactSearch = (
  backupId: string | number,
  searchQuery: string,
  params?: Omit<GetContactsParams, "search">,
) => {
  const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return useQuery({
    queryKey: ["contacts", "search", backupId, debouncedQuery, params],
    queryFn: () =>
      getContacts(Number(backupId), {
        ...params,
        search: debouncedQuery,
      }),
    enabled:
      !!backupId && !!debouncedQuery.trim() && debouncedQuery.length >= 2,
    staleTime: 1000 * 30,
  });
};

export const useFavoriteContacts = (
  backupId: string | number,
  params?: Omit<GetContactsParams, "is_favorite">,
) => {
  return useQuery({
    queryKey: ["contacts", "favorites", backupId, params],
    queryFn: () =>
      getContacts(Number(backupId), {
        ...params,
        is_favorite: true,
      }),
    enabled: !!backupId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useContactManager = (backupId: string | number) => {
  const {
    searchQuery,
    filters,
    sortConfig,
    setSearchQuery,
    setFilters,
    setSortConfig,
    clearFilters,
  } = useContactStore();

  const buildParams = useCallback((): GetContactsParams => {
    const params: GetContactsParams = {
      page_size: 10,
    };

    if (searchQuery?.trim()) {
      params.search = searchQuery.trim();
    }

    if (filters.is_favorite !== undefined) {
      params.is_favorite = filters.is_favorite;
    }

    if (filters.has_image !== undefined) {
      params.has_image = filters.has_image;
    }

    const { field, direction } = sortConfig;
    const orderingPrefix = direction === "desc" ? "-" : "";
    params.ordering = `${orderingPrefix}${field}`;

    return params;
  }, [searchQuery, filters, sortConfig]);

  const infiniteQuery = useContactInfiniteList(backupId, buildParams());

  const allContacts = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap(
      (page: ApiResponseList<Contact[]>) => page.results || [],
    );
  }, [infiniteQuery.data?.pages]);

  const stats = useMemo((): ContactStats => {
    const totalFromBackend = infiniteQuery.data?.pages[0]?.total_results || 0;
    const favorites = allContacts.filter((c) => c.is_favorite).length;
    const withPhotos = allContacts.filter((c) => c.profile_image).length;
    const withBirthdays = allContacts.filter((c) => c.date_of_birth).length;

    return {
      total: totalFromBackend,
      favorites,
      withPhotos,
      withBirthdays,
    };
  }, [allContacts, infiniteQuery.data]);

  const groupedContacts = useMemo(() => {
    if (sortConfig.field === "is_favorite") {
      return {
        _favorites_list: allContacts,
        _letterOrder: ["_favorites_list"],
        _isFavoriteSort: true,
      };
    }

    const groups: Record<string, Contact[]> = {};
    const letterOrder: string[] = [];

    allContacts.forEach((contact) => {
      const displayName = contact.name || "Unknown";
      const letter = displayName.charAt(0).toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
        letterOrder.push(letter);
      }
      groups[letter].push(contact);
    });

    letterOrder.sort();

    return {
      ...groups,
      _letterOrder: letterOrder,
      _isFavoriteSort: false,
    };
  }, [allContacts, sortConfig.field]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery?.trim()) count++;
    if (filters.is_favorite === true) count++;
    if (filters.has_image === true) count++;
    return count;
  }, [searchQuery, filters]);

  const refresh = useCallback(() => {
    infiniteQuery.refetch();
  }, [infiniteQuery]);

  return {
    contacts: allContacts,
    filteredContacts: allContacts,
    groupedContacts,
    stats,
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
    isSuccess: infiniteQuery.isSuccess,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    refetch: infiniteQuery.refetch,
    refresh,

    data: infiniteQuery.data?.pages?.[infiniteQuery.data.pages.length - 1],

    searchQuery,
    filters,
    sortConfig,

    setSearchQuery,
    setFilters,
    setSortConfig,
    clearFilters,

    allContacts,
    activeFiltersCount,
    buildParams,
  };
};

export const useLocalContactState = () => {
  const [selectedContacts, setSelectedContacts] = React.useState<Contact[]>([]);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const [localFilters, setLocalFilters] = React.useState({
    showFavoritesOnly: false,
    showWithPhotosOnly: false,
  });

  const toggleContactSelection = React.useCallback((contact: Contact) => {
    setSelectedContacts((prev) => {
      const isSelected = prev.some((c) => c.id === contact.id);
      return isSelected
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact];
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedContacts([]);
  }, []);

  const isContactSelected = React.useCallback(
    (contact: Contact) => {
      return selectedContacts.some((c) => c.id === contact.id);
    },
    [selectedContacts],
  );

  return {
    selectedContacts,
    viewMode,
    localFilters,
    setViewMode,
    setLocalFilters,
    toggleContactSelection,
    clearSelection,
    isContactSelected,
  };
};

export const useContactActions = () => {
  const handleCall = React.useCallback((contact: Contact) => {
    console.log(`Calling ${contact.name} at ${contact.phone_number}`);
  }, []);

  const handleMessage = React.useCallback((contact: Contact) => {
    console.log(`Messaging ${contact.name} at ${contact.phone_number}`);
  }, []);

  const handleEmail = React.useCallback((contact: Contact) => {
    console.log(`Emailing ${contact.name}`);
  }, []);

  const handleEdit = React.useCallback((contact: Contact) => {
    console.log(`Editing ${contact.name}`);
  }, []);

  const handleDelete = React.useCallback((contact: Contact) => {
    console.log(`Deleting ${contact.name}`);
  }, []);

  const handleToggleFavorite = React.useCallback((contact: Contact) => {
    console.log(`Toggling favorite for ${contact.name}`);
  }, []);

  return {
    handleCall,
    handleMessage,
    handleEmail,
    handleEdit,
    handleDelete,
    handleToggleFavorite,
  };
};

export const useInfiniteScroll = (
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean,
) => {
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  React.useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "50px",
        threshold: 0.1,
      },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef && observerRef.current) {
      observerRef.current.observe(currentRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  return { loadMoreRef };
};
