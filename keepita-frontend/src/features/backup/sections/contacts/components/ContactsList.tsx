import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Star, MessageCircle, User, Info } from "lucide-react";
import type { Contact } from "../types/contact.types";
import {
  getDisplayName,
  getInitials,
  formatPhoneNumber,
} from "../utils/contact.utils";
import { getContactAvatarColor } from "../../../constants/samsung.constants";
import { useBackupTheme } from "@/features/backup/store/backupThemes.store";

interface ContactsListProps {
  contacts: Contact[];
  searchQuery?: string;
  onContactSelect?: (contact: Contact) => void;
  baseIndex?: number;
}

const AppleContactItem: React.FC<{
  contact: Contact;
  isFirst: boolean;
  onSelect: (contact: Contact) => void;
}> = ({ contact, isFirst, onSelect }) => {
  const displayName = getDisplayName(contact);
  const phoneNumber = formatPhoneNumber(contact.phone_number);

  return (
    <motion.div
      className="flex items-center px-4 py-4 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer relative "
      onClick={() => onSelect(contact)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {!isFirst && (
        <div className="absolute top-0 left-16 right-0 h-px bg-gray-200" />
      )}

      <div className="relative mr-4 flex-shrink-0">
        {contact.profile_image ? (
          <img
            src={contact.profile_image}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-black text-lg truncate">
          {displayName}
        </h3>
        <p className="text-md text-gray-500 truncate">{phoneNumber}</p>
      </div>

      <div className="ml-4">
        <Info className="w-8 h-8 text-[#2F7CF5]" />
      </div>
    </motion.div>
  );
};

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  searchQuery = "",
  onContactSelect,
  baseIndex = 0,
}) => {
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const { theme } = useBackupTheme();

  const themeClasses = {
    Samsung: {
      wrapper: "bg-white space-y-1 p-4",
      itemWrapper: "bg-gray-100 rounded-full",
      highlightBg: "bg-blue-100 text-blue-800",
      ripple: "bg-blue-200",
      quickActions: true,
    },
    Xiaomi: {
      wrapper: "bg-red-100 space-y-1 p-4",
      itemWrapper: "bg-gray-100",
      highlightBg: "bg-red-100 text-blue-800",
      ripple: "bg-blue-200",
      quickActions: false,
    },
    Apple: {},
  };

  const currentTheme =
    themeClasses[theme as "Samsung" | "Xiaomi"] ?? themeClasses.Samsung;

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Phone className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No contacts found
        </h3>
        <p className="text-gray-500 text-center">
          {searchQuery
            ? "Try a different search term"
            : "Add contacts to get started"}
        </p>
      </div>
    );
  }

  const handleContactPress = (contact: Contact, index: number) => {
    setSelectedContact(index);
    setTimeout(() => setSelectedContact(null), 150);
    onContactSelect?.(contact);
  };

  const handleAppleContactSelect = (contact: Contact) => {
    onContactSelect?.(contact);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className={`${currentTheme.highlightBg} font-medium`}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  if (theme === "Apple") {
    const groupedContacts = contacts.reduce(
      (acc, contact) => {
        const displayName = getDisplayName(contact);
        let letter = displayName.charAt(0).toUpperCase();
        if (!/^[A-Z]$/.test(letter)) {
          letter = "#";
        }
        if (!acc[letter]) {
          acc[letter] = [];
        }
        acc[letter].push(contact);
        return acc;
      },
      {} as Record<string, Contact[]>,
    );

    const sortedLetters = Object.keys(groupedContacts).sort();

    return (
      <div className="mx-5">
        <AnimatePresence>
          {sortedLetters.map((letter) => (
            <motion.div
              key={letter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white rounded-xl overflow-hidden mb-4">
                {groupedContacts[letter].map((contact, index) => (
                  <AppleContactItem
                    key={contact.id}
                    contact={contact}
                    isFirst={index === 0}
                    onSelect={handleAppleContactSelect}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={currentTheme.wrapper}>
      {contacts.map((contact, index) => {
        const displayName = getDisplayName(contact);

        return (
          <motion.div
            key={contact.id}
            data-contact-index={baseIndex + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className={`${currentTheme.itemWrapper} 
              ${
                theme === "Xiaomi"
                  ? contacts.length === 1
                    ? "rounded-3xl"
                    : index === 0
                      ? "rounded-t-3xl rounded-b-md"
                      : index === contacts.length - 1
                        ? "rounded-b-3xl rounded-t-md"
                        : "rounded-md"
                  : "rounded-3xl"
              }
              relative border-b border-gray-100 last:border-b-0 transition-all duration-150
              ${
                selectedContact === index
                  ? ` scale-[0.98]`
                  : "hover:bg-gray-50 active:bg-gray-100"
              }`}
            onClick={() => handleContactPress(contact, index)}
          >
            <div className="flex items-center px-4 py-3.5">
              <div className="relative mr-4 flex-shrink-0">
                {contact.profile_image ? (
                  <img
                    src={contact.profile_image}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-stone-700 font-medium text-3xl"
                    style={{
                      backgroundColor: getContactAvatarColor(index),
                    }}
                  >
                    {getInitials(displayName)}
                  </div>
                )}

                {contact.is_favorite && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Star className="w-3 h-3 text-white fill-current" />
                  </motion.div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-700 text-[16px] leading-tight truncate">
                  {highlightText(displayName, searchQuery)}
                </h3>
                <p className="text-[14px] text-gray-500 truncate mt-0.5">
                  {highlightText(
                    formatPhoneNumber(contact.phone_number),
                    searchQuery,
                  )}
                </p>
                {contact.date_of_birth && (
                  <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                    Birthday:{" "}
                    {new Date(contact.date_of_birth).toLocaleDateString()}
                  </p>
                )}
              </div>

              {currentTheme.quickActions && (
                <div className="flex items-center space-x-1 ml-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-full bg-green-50 hover:bg-green-100 active:bg-green-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`sms:${contact.phone_number}`, "_self");
                    }}
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </motion.button>
                </div>
              )}
            </div>

            <AnimatePresence>
              {selectedContact === index && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 ${currentTheme.ripple} rounded-full pointer-events-none`}
                  style={{ transformOrigin: "center" }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ContactsList;
