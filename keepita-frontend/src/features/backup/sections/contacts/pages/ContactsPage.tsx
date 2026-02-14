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
import { useContactManager, useInfiniteScroll } from "../hooks/contacts.hooks";
import type { Contact } from "../types/contact.types";
import { getDisplayName } from "../utils/contact.utils";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

type Theme = "Samsung" | "Xiaomi" | "Apple";

interface ThemeClasses {
  listWrapper: string;
  letterHeader: string;
  letterTitle?: string;
  favoriteWrapper: string;
  showEndOfList: boolean;
}

const themeClasses: Record<Theme, ThemeClasses> = {
  Samsung: {
    listWrapper: "bg-white",
    letterHeader:
      "sticky top-0 z-10 bg-white/95 border-gray-100 backdrop-blur-sm px-4 border-b",
    letterTitle: "text-lg text-blue-600 font-semibold",
    favoriteWrapper: "bg-white",
    showEndOfList: true,
  },
  Xiaomi: {
    listWrapper: "bg-white",
    letterHeader:
      "sticky top-0 z-10 bg-red-100 border-transparent backdrop-blur-sm px-4 border-b",
    letterTitle: "text-md text-stone-600 pl-6 font-semibold",
    favoriteWrapper: "bg-red-100 ",
    showEndOfList: false,
  },
  Apple: {
    listWrapper: "bg-white",
    letterHeader: "sticky top-0 z-10 bg-white px-4",
    favoriteWrapper: "bg-white",
    showEndOfList: true,
  },
};

const ContactsPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();
  const { theme } = useBackupTheme();
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [hasLoadedInitially, setHasLoadedInitially] = React.useState(false);

  useDocumentTitle(`Contacts - Backup ${backupId} | Keepita`);

  const currentTheme = themeClasses[theme as Theme] ?? themeClasses.Samsung;

  const { backup, isLoading: isBackupLoading, error: backupError } =
    useBackupDetails(backupId);

  const contactManager = useContactManager(backupId!);
  const {
    filteredContacts,
    groupedContacts,
    stats,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,

    searchQuery,
    filters,
    sortConfig,

    setSearchQuery,
    setFilters,
    setSortConfig,
  } = contactManager;

  React.useEffect(() => {
    if (filteredContacts.length > 0 && !hasLoadedInitially) {
      setHasLoadedInitially(true);
    }
  }, [filteredContacts.length, hasLoadedInitially]);

  const isInitialLoading = isLoading && !hasLoadedInitially;
  const isSearchFilterLoading = isLoading && hasLoadedInitially;

  const { loadMoreRef } = useInfiniteScroll(
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  );

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const scrollToLetter = (letter: string) => {
    setSelectedLetter(letter);

    if ((groupedContacts as { _isFavoriteSort?: boolean })._isFavoriteSort) {
      const contactIndex = filteredContacts.findIndex((contact) => {
        const displayName = getDisplayName(contact);
        return displayName.charAt(0).toUpperCase() === letter;
      });

      if (contactIndex >= 0) {
        const contactElement = document.querySelector(
          `[data-contact-index="${contactIndex}"]`
        );
        if (contactElement) {
          contactElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } else {
      const element = document.getElementById(`letter-${letter}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleContactSelect = (contact: Contact) => {
    console.log("Selected contact:", contact);
  };

  const renderContent = () => {
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
      return (
        <ContactsEmptyState
          hasSearchQuery={!!searchQuery}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
          isRender={theme !== "Xiaomi"}
        />
      );
    }

    return (
      <div>
        {(groupedContacts as { _isFavoriteSort?: boolean })._isFavoriteSort ? (
          <div className={currentTheme.favoriteWrapper}>
            <ContactsList
              contacts={filteredContacts}
              searchQuery={searchQuery}
              onContactSelect={handleContactSelect}
              baseIndex={0}
            />
          </div>
        ) : (
          Object.entries(groupedContacts)
            .filter(([key]) => !key.startsWith("_"))
            .sort(([letterA], [letterB]) => {
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
                className={currentTheme.listWrapper}
              >
                <div className={currentTheme.letterHeader}>
                  <h3
                    className={
                      currentTheme.letterTitle ||
                      "text-lg text-blue-600 font-semibold"
                    }
                  >
                    {letter}
                  </h3>
                </div>
                <ContactsList
                  contacts={letterContacts as Contact[]}
                  searchQuery={searchQuery}
                  onContactSelect={handleContactSelect}
                  baseIndex={0}
                />
              </motion.div>
            ))
        )}

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

        {!hasNextPage &&
          filteredContacts.length > 0 &&
          currentTheme.showEndOfList && (
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
      {theme === "Samsung" && (
        <div className="fixed right-3 top-1/2 transform -translate-y-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-full py-1 px-1 shadow-lg border border-gray-200">
            {alphabet.map((letter) => {
              const hasContacts = (
                groupedContacts as { _isFavoriteSort?: boolean }
              )._isFavoriteSort
                ? filteredContacts.some((contact) => {
                  const displayName = getDisplayName(contact);
                  return displayName.charAt(0).toUpperCase() === letter;
                })
                : Array.isArray(
                  (groupedContacts as Record<string, unknown>)[letter]
                ) &&
                (
                  (groupedContacts as Record<string, unknown>)[
                  letter
                  ] as unknown[]
                ).length > 0;

              return (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => scrollToLetter(letter)}
                  disabled={!hasContacts}
                  className={`block w-6 h-6 text-xs font-medium rounded-full transition-all duration-200 ${selectedLetter === letter
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
      )}

      {renderContent()}
    </ContactsLayout>
  );
};

export default ContactsPage;
