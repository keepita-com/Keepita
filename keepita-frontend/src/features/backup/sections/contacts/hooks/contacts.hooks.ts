/**
 * contacts.hooks.ts
 * Refactored contact hooks - React Query for server state, Zustand for client state only
 */
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

/**
 * Base contact query hook following Single Responsibility Principle
 */
export const useContactList = (
  backupId: string | number,
  params?: GetContactsParams
) => {
  const query = useQuery({
    queryKey: ["contacts", backupId, params],
    queryFn: async () => {
      const response = await getContacts(Number(backupId), params);
      return response;
    },
    enabled: !!backupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
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

/**
 * Infinite contact query hook for pagination
 */
export const useContactInfiniteList = (
  backupId: string | number,
  params?: GetContactsParams
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
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter for better responsiveness
    gcTime: 1000 * 60 * 5, // 5 minutes
    getNextPageParam: (lastPage: ApiResponseList<Contact[]>) => {
      return lastPage.has_next ? lastPage.current_page + 1 : undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 2, // Limit retries for better performance
  });
};

/**
 * Contact search hook with debouncing
 */
export const useContactSearch = (
  backupId: string | number,
  searchQuery: string,
  params?: Omit<GetContactsParams, "search">
) => {
  const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);

  // Debounce search query
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
    staleTime: 1000 * 30, // 30 seconds for search results
  });
};

/**
 * Favorite contacts hook
 */
export const useFavoriteContacts = (
  backupId: string | number,
  params?: Omit<GetContactsParams, "is_favorite">
) => {
  return useQuery({
    queryKey: ["contacts", "favorites", backupId, params],
    queryFn: () =>
      getContacts(Number(backupId), {
        ...params,
        is_favorite: true,
      }),
    enabled: !!backupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Main contact manager hook with infinite scroll
 * React Query is the single source of truth for server state
 * Zustand is only used for client-side state (filters, search, sorting)
 */
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

  // Build API parameters from client-side state
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

    // Build ordering parameter from sort config
    const { field, direction } = sortConfig;
    const orderingPrefix = direction === "desc" ? "-" : "";
    params.ordering = `${orderingPrefix}${field}`;

    return params;
  }, [searchQuery, filters, sortConfig]);

  // Use infinite scroll query for Samsung-style contact loading
  const infiniteQuery = useContactInfiniteList(backupId, buildParams());

  // Flatten all contact pages into a single array (computed from React Query data)
  const allContacts = useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap(
      (page: ApiResponseList<Contact[]>) => page.results || []
    );
  }, [infiniteQuery.data?.pages]);

  // Calculate stats from React Query data
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

  // Group contacts by letter for display (computed from React Query data)
  const groupedContacts = useMemo(() => {
    // When sorting by favorites, don't group - return a simple structure
    // to preserve exact backend ordering
    if (sortConfig.field === "is_favorite") {
      return {
        _favorites_list: allContacts,
        _letterOrder: ["_favorites_list"],
        _isFavoriteSort: true,
      };
    }

    // For name sorting, group alphabetically
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

    // Sort letter order alphabetically for name sorting
    letterOrder.sort();

    return {
      ...groups,
      _letterOrder: letterOrder,
      _isFavoriteSort: false,
    };
  }, [allContacts, sortConfig.field]);

  // Calculate active filters count
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
    // Server state from React Query
    contacts: allContacts,
    filteredContacts: allContacts, // Backend handles filtering via API params
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

    // Latest page data for compatibility
    data: infiniteQuery.data?.pages?.[infiniteQuery.data.pages.length - 1],

    // Client state from Zustand
    searchQuery,
    filters,
    sortConfig,

    // Client actions from Zustand
    setSearchQuery,
    setFilters,
    setSortConfig,
    clearFilters,

    // Computed values
    allContacts,
    activeFiltersCount,
    buildParams,
  };
};

/**
 * Local contact state hook for components (Interface Segregation)
 */
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
    [selectedContacts]
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

/**
 * Contact actions hook (Command Pattern)
 */
export const useContactActions = () => {
  const handleCall = React.useCallback((contact: Contact) => {
    console.log(`Calling ${contact.name} at ${contact.phone_number}`);
    // Implement call functionality
  }, []);

  const handleMessage = React.useCallback((contact: Contact) => {
    console.log(`Messaging ${contact.name} at ${contact.phone_number}`);
    // Implement message functionality
  }, []);

  const handleEmail = React.useCallback((contact: Contact) => {
    console.log(`Emailing ${contact.name}`);
    // Implement email functionality
  }, []);

  const handleEdit = React.useCallback((contact: Contact) => {
    console.log(`Editing ${contact.name}`);
    // Implement edit functionality
  }, []);

  const handleDelete = React.useCallback((contact: Contact) => {
    console.log(`Deleting ${contact.name}`);
    // Implement delete functionality
  }, []);

  const handleToggleFavorite = React.useCallback((contact: Contact) => {
    console.log(`Toggling favorite for ${contact.name}`);
    // Implement toggle favorite functionality
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

/**
 * Infinite scroll intersection observer hook for Samsung-style smooth loading
 */
export const useInfiniteScroll = (
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean
) => {
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  React.useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create intersection observer with better configuration
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        // Trigger fetch when element is intersecting and we have next page
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: "50px", // Start loading 50px before reaching the element
        threshold: 0.1, // Trigger when 10% is visible
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef && observerRef.current) {
      observerRef.current.observe(currentRef);
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  return { loadMoreRef };
};
