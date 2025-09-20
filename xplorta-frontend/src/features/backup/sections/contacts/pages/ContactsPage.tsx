import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import {
  ContactsList,
  ContactsLayout,
  ContactListSkeleton,
  ContactsEmptyState,
} from "../components";
import { useContactManager, useInfiniteScroll } from "../hooks//contacts.hooks";
import type { Contact } from "../types/contact.types";
import { getDisplayName } from "../utils/contact.utils";

const ContactsPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<string>("");

  if (!backupId) {
    navigate("/backups");
    return null;
  }
  useDocumentTitle(`Contacts - Backup ${backupId} | xplorta`);

  const contactManager = useContactManager(backupId);
  const {
    // Server state from React Query
    filteredContacts,
    groupedContacts,
    stats,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,

    // Client state from Zustand
    searchQuery,
    filters,
    sortConfig,

    // Client actions from Zustand
    setSearchQuery,
    setFilters,
    setSortConfig,
  } = contactManager;

  // Track if we have ever loaded data to distinguish initial loading from search/filter operations
  const [hasLoadedInitially, setHasLoadedInitially] = React.useState(false);

  // Mark as initially loaded once we have data
  React.useEffect(() => {
    if (filteredContacts.length > 0 && !hasLoadedInitially) {
      setHasLoadedInitially(true);
    }
  }, [filteredContacts.length, hasLoadedInitially]);

  // Determine if this is initial loading (show full page loader) or search/filter operation (show skeleton)
  const isInitialLoading = isLoading && !hasLoadedInitially;
  const isSearchFilterLoading = isLoading && hasLoadedInitially;

  // Set up infinite scroll with improved performance
  const { loadMoreRef } = useInfiniteScroll(
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  );

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const scrollToLetter = (letter: string) => {
    setSelectedLetter(letter);

    if ((groupedContacts as any)._isFavoriteSort) {
      // For favorite sorting, find the first contact starting with this letter
      const contactIndex = filteredContacts.findIndex((contact) => {
        const displayName = getDisplayName(contact);
        return displayName.charAt(0).toUpperCase() === letter;
      });

      if (contactIndex >= 0) {
        // For list view in favorite mode, look for contact by index
        const contactElement = document.querySelector(
          `[data-contact-index="${contactIndex}"]`
        );
        if (contactElement) {
          contactElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } else {
      // For name sorting, scroll to the letter group
      const element = document.getElementById(`letter-${letter}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleContactSelect = (contact: Contact) => {
    // Add contact selection logic here - could open modal or navigate
    console.log("Selected contact:", contact);
    // TODO: Implement contact detail modal or navigation
  };
  const renderContent = () => {
    // Show skeleton loading during:
    // 1. Initial loading with no data
    // 2. Search/filter/sort operations (when refetching)
    // 3. When isFetchingNextPage and we have no current data
    const shouldShowSkeleton =
      (isLoading && filteredContacts.length === 0) ||
      (isFetchingNextPage && filteredContacts.length === 0) ||
      isSearchFilterLoading;

    if (shouldShowSkeleton) {
      return (
        <ContactListSkeleton count={8} isProcessing={isSearchFilterLoading} />
      );
    }

    if (!filteredContacts || filteredContacts.length === 0) {
      // Use separate empty state component
      return (
        <ContactsEmptyState
          hasSearchQuery={!!searchQuery}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      );
    }

    // Samsung List View - only view mode
    return (
      <div className="pr-12">
        {/* Handle favorite sorting differently - show as simple list */}
        {(groupedContacts as any)._isFavoriteSort ? (
          <div className="bg-white">
            <ContactsList
              contacts={filteredContacts}
              searchQuery={searchQuery}
              onContactSelect={handleContactSelect}
              baseIndex={0}
            />
          </div>
        ) : (
          /* Regular alphabetical grouping for name sorting */
          Object.entries(groupedContacts)
            .filter(([key]) => !key.startsWith("_")) // Filter out internal properties
            .sort(([letterA], [letterB]) => {
              // Sort letters alphabetically for name sorting
              const comparison = letterA.localeCompare(letterB);
              return sortConfig.direction === "desc" ? -comparison : comparison;
            })
            .map(([letter, letterContacts]) => (
              <motion.div
                key={letter}
                id={`letter-${letter}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white"
              >
                {/* Letter Header - Samsung Style */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-blue-600">
                    {letter}
                  </h3>
                </div>
                {/* Contacts List */}
                <ContactsList
                  contacts={letterContacts as Contact[]}
                  searchQuery={searchQuery}
                  onContactSelect={handleContactSelect}
                  baseIndex={0} // Will be updated with cumulative index
                />
              </motion.div>
            ))
        )}

        {/* Infinite Scroll Trigger at the end */}
        {hasNextPage && (
          <div
            ref={loadMoreRef}
            className="flex items-center justify-center py-8 min-h-[60px]"
          >
            {isFetchingNextPage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-3 text-gray-500"
              >
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">
                  Loading more contacts...
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-gray-400"
              >
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                </div>
                <span className="text-sm">Scroll to load more</span>
              </motion.div>
            )}
          </div>
        )}
        {/* End of list indicator */}
        {!hasNextPage && filteredContacts.length > 0 && (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-gray-400">
              No more contacts to load
            </span>
          </div>
        )}
      </div>
    );
  };
  return (
    <ContactsLayout
      title="Contacts"
      subtitle={`${stats.total || 0} contacts`}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filters={filters}
      onFiltersChange={setFilters}
      sortConfig={sortConfig}
      onSortChange={setSortConfig}
      onBack={() => navigate(`/backups/${backupId}`)}
      isLoading={isInitialLoading}
      resultsCount={filteredContacts.length}
    >
      {/* Alphabet Index Sidebar - Samsung Style - Vertically centered */}
      <div className="fixed right-3 top-1/2 transform -translate-y-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-full py-1 px-1 shadow-lg border border-gray-200">
          {alphabet.map((letter) => {
            // For favorite sorting, check if any contact starting with this letter exists
            // For name sorting, check the grouped contacts
            const hasContacts = (groupedContacts as any)._isFavoriteSort
              ? filteredContacts.some((contact) => {
                  const displayName = getDisplayName(contact);
                  return displayName.charAt(0).toUpperCase() === letter;
                })
              : (groupedContacts as any)[letter]?.length > 0;

            return (
              <motion.button
                key={letter}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollToLetter(letter)}
                disabled={!hasContacts}
                className={`block w-6 h-6 text-xs font-medium rounded-full transition-all duration-200 ${
                  selectedLetter === letter
                    ? "bg-blue-600 text-white font-bold"
                    : hasContacts
                    ? "text-gray-600 hover:bg-gray-100"
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </ContactsLayout>
  );
};

export default ContactsPage;
