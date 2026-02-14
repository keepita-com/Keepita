import React from "react";
import {
  User,
  MessageSquare,
  Calendar,
  Eye,
  EyeOff,
  FileX,
} from "lucide-react";

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "checkbox";
  placeholder?: string;
}

export interface FilterSection {
  title: string;
  icon: React.ReactNode;
  fields: FilterField[];
}

export interface SortOption {
  key: string;
  label: string;
  searchFields: string[];
}

export const MESSAGE_FILTER_SECTIONS: FilterSection[] = [
  {
    title: "Contact Filters",
    icon: React.createElement(User, { size: 16 }),
    fields: [
      {
        key: "contact",
        label: "Contact ID",
        type: "text",
        placeholder: "Enter contact ID...",
      },
      {
        key: "address",
        label: "Address",
        type: "text",
        placeholder: "Enter address...",
      },
      {
        key: "contact_name",
        label: "Contact Name",
        type: "text",
        placeholder: "Enter contact name...",
      },
      {
        key: "contact_phone",
        label: "Phone Number",
        type: "text",
        placeholder: "Enter phone number...",
      },
    ],
  },
  {
    title: "Message Filters",
    icon: React.createElement(MessageSquare, { size: 16 }),
    fields: [
      {
        key: "min_messages",
        label: "Minimum Messages",
        type: "number",
        placeholder: "Min count...",
      },
      {
        key: "max_messages",
        label: "Maximum Messages",
        type: "number",
        placeholder: "Max count...",
      },
    ],
  },
  {
    title: "Date Filters",
    icon: React.createElement(Calendar, { size: 16 }),
    fields: [
      {
        key: "created_after",
        label: "Created After",
        type: "date",
      },
      {
        key: "created_before",
        label: "Created Before",
        type: "date",
      },
      {
        key: "last_message_after",
        label: "Last Message After",
        type: "date",
      },
      {
        key: "last_message_before",
        label: "Last Message Before",
        type: "date",
      },
    ],
  },
];

export const MESSAGE_SORT_OPTIONS: SortOption[] = [
  {
    key: "created_at",
    label: "Created Date",
    searchFields: ["address", "contact__name", "contact__phone_number"],
  },
  {
    key: "address",
    label: "Address",
    searchFields: ["address", "contact__name", "contact__phone_number"],
  },
];

export const MESSAGE_SORT_OPTIONS_FOR_HEADER = [
  {
    value: "-created_at",
    label: "Newest First",
    field: "created_at",
    direction: "desc" as const,
  },
  {
    value: "created_at",
    label: "Oldest First",
    field: "created_at",
    direction: "asc" as const,
  },
  {
    value: "-last_message_date",
    label: "Recent Activity",
    field: "last_message_date",
    direction: "desc" as const,
  },
  {
    value: "address",
    label: "Contact A-Z",
    field: "address",
    direction: "asc" as const,
  },
  {
    value: "-address",
    label: "Contact Z-A",
    field: "address",
    direction: "desc" as const,
  },
];

export const MESSAGE_CONVERSATION_FILTER_SECTIONS: FilterSection[] = [
  {
    title: "Message Content",
    icon: React.createElement(MessageSquare, { size: 16 }),
    fields: [
      {
        key: "search",
        label: "Search Messages",
        type: "text",
        placeholder: "Search message content...",
      },
      {
        key: "body",
        label: "Message Body",
        type: "text",
        placeholder: "Filter by message body...",
      },
    ],
  },
  {
    title: "Message Status",
    icon: React.createElement(User, { size: 16 }),
    fields: [
      {
        key: "status",
        label: "Message Status",
        type: "text",
        placeholder: "Enter status (0=sent, 1=received)...",
      },
    ],
  },
  {
    title: "Date Filters",
    icon: React.createElement(Calendar, { size: 16 }),
    fields: [
      {
        key: "date_after",
        label: "After Date",
        type: "date",
      },
      {
        key: "date_before",
        label: "Before Date",
        type: "date",
      },
      {
        key: "created_after",
        label: "Created After",
        type: "date",
      },
      {
        key: "created_before",
        label: "Created Before",
        type: "date",
      },
    ],
  },
];

export const MESSAGE_CONVERSATION_SORT_OPTIONS_FOR_HEADER = [
  {
    value: "date",
    label: "Oldest First",
    field: "date",
    direction: "asc" as const,
  },
  {
    value: "-date",
    label: "Newest First",
    field: "date",
    direction: "desc" as const,
  },
  {
    value: "created_at",
    label: "Created First",
    field: "created_at",
    direction: "asc" as const,
  },
  {
    value: "-created_at",
    label: "Created Latest",
    field: "created_at",
    direction: "desc" as const,
  },
  {
    value: "status",
    label: "By Status",
    field: "status",
    direction: "asc" as const,
  },
  {
    value: "-status",
    label: "By Status (desc)",
    field: "status",
    direction: "desc" as const,
  },
];

export interface ConversationQuickFilter {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  value: any;
  activeValue: any;
  colors: {
    active: string;
    inactive: string;
  };
}

export const CONVERSATION_QUICK_FILTERS: ConversationQuickFilter[] = [
  {
    key: "seen",
    label: "Seen",
    icon: Eye,
    value: true,
    activeValue: true,
    colors: {
      active: "bg-green-100 border-green-300 text-green-800",
      inactive: "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200",
    },
  },
  {
    key: "seen",
    label: "Unseen",
    icon: EyeOff,
    value: false,
    activeValue: false,
    colors: {
      active: "bg-red-100 border-red-300 text-red-800",
      inactive: "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200",
    },
  },
  {
    key: "body_empty",
    label: "Empty",
    icon: FileX,
    value: true,
    activeValue: true,
    colors: {
      active: "bg-yellow-100 border-yellow-300 text-yellow-800",
      inactive: "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200",
    },
  },
];

export interface MessageQuickFilter {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  value: any;
  activeValue: any;
  colors: {
    active: string;
    inactive: string;
  };
}

export const MESSAGE_QUICK_FILTERS: MessageQuickFilter[] = [
  {
    key: "has_unread",
    label: "Unread",
    icon: MessageSquare,
    value: true,
    activeValue: true,
    colors: {
      active: "bg-blue-100 border-blue-300 text-blue-800",
      inactive: "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200",
    },
  },
  {
    key: "is_favorite_contact",
    label: "Favorites",
    icon: User,
    value: true,
    activeValue: true,
    colors: {
      active: "bg-green-100 border-green-300 text-green-800",
      inactive: "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200",
    },
  },
  {
    key: "has_messages",
    label: "Has Messages",
    icon: MessageSquare,
    value: true,
    activeValue: true,
    colors: {
      active: "bg-purple-100 border-purple-300 text-purple-800",
      inactive: "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200",
    },
  },
];
