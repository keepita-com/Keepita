import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Star, MessageCircle } from "lucide-react";
import type { Contact } from "../types/contact.types";
import {
  getDisplayName,
  getInitials,
  formatPhoneNumber,
} from "../utils/contact.utils";
import { getContactAvatarColor } from "../../../constants/samsung.constants";

interface ContactsListProps {
  contacts: Contact[];
  searchQuery?: string;
  onContactSelect?: (contact: Contact) => void;
  baseIndex?: number; // For proper scrolling in favorite sort mode
}

// Make sure the component doesn't sort contacts internally, just display them as provided
const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  searchQuery = "",
  onContactSelect,
  baseIndex = 0,
}) => {
  const [selectedContact, setSelectedContact] = useState<number | null>(null);

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

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-blue-100 text-blue-800 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  return (
    <div className="bg-white space-y-1 p-4">
      {" "}
      {contacts.map((contact, index) => {
        // Safely handle possible undefined name and contact data
        const displayName = getDisplayName(contact);

        return (
          <motion.div
            key={contact.id}
            data-contact-index={baseIndex + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className={` bg-gray-100 rounded-full 
            relative border-b border-gray-100 last:border-b-0 transition-all duration-150
            ${
              selectedContact === index
                ? "bg-gray-50 scale-[0.98]"
                : "hover:bg-gray-50 active:bg-gray-100"
            }
          `}
            onClick={() => handleContactPress(contact, index)}
          >
            <div className="flex items-center px-4 py-3.5">
              {" "}
              {/* Profile Avatar */}
              <div className="relative mr-4 flex-shrink-0">
                {contact.profile_image ? (
                  <img
                    src={contact.profile_image}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{
                      backgroundColor: getContactAvatarColor(index),
                    }}
                  >
                    {getInitials(displayName)}
                  </div>
                )}

                {/* Favorite Star Badge */}
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
              {/* Contact Information */}
              <div className="flex-1 min-w-0">
                {/* Name */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 text-[16px] leading-tight truncate">
                    {highlightText(getDisplayName(contact), searchQuery)}
                  </h3>
                </div>

                {/* Phone Number */}
                <div className="flex items-center mt-0.5">
                  <p className="text-[14px] text-gray-500 truncate">
                    {highlightText(
                      formatPhoneNumber(contact.phone_number),
                      searchQuery
                    )}
                  </p>
                </div>

                {/* Birthday (if available) */}
                {contact.date_of_birth && (
                  <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                    Birthday:{" "}
                    {new Date(contact.date_of_birth).toLocaleDateString()}
                  </p>
                )}
              </div>
              {/* Quick Action Buttons */}
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
            </div>

            {/* Ripple Effect for Touch */}
            <AnimatePresence>
              {selectedContact === index && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-blue-200 rounded-full pointer-events-none"
                  style={{
                    transformOrigin: "center",
                  }}
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
