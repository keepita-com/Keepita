import type {
  Message,
  MessageThread,
  ConversationGroup,
  ChatListFilters,
  ChatMessageFilters,
} from "../types/message.types";

export const buildThreadsQueryParams = (
  page: number = 1,
  filters: ChatListFilters = {},
): URLSearchParams => {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: "20",
  });

  if (filters.search) params.append("search", filters.search);
  if (filters.contact) params.append("contact", filters.contact);
  if (filters.address) params.append("address", filters.address);
  if (filters.contact_name) params.append("contact_name", filters.contact_name);
  if (filters.contact_phone)
    params.append("contact_phone", filters.contact_phone);
  if (filters.is_favorite_contact !== undefined) {
    params.append(
      "is_favorite_contact",
      filters.is_favorite_contact.toString(),
    );
  }
  if (filters.created_after)
    params.append("created_after", filters.created_after);
  if (filters.created_before)
    params.append("created_before", filters.created_before);
  if (filters.has_messages !== undefined) {
    params.append("has_messages", filters.has_messages.toString());
  }
  if (filters.min_messages !== undefined) {
    params.append("min_messages", filters.min_messages.toString());
  }
  if (filters.max_messages !== undefined) {
    params.append("max_messages", filters.max_messages.toString());
  }
  if (filters.has_unread !== undefined) {
    params.append("has_unread", filters.has_unread.toString());
  }
  if (filters.last_message_after)
    params.append("last_message_after", filters.last_message_after);
  if (filters.last_message_before)
    params.append("last_message_before", filters.last_message_before);
  if (filters.ordering) params.append("ordering", filters.ordering);

  return params;
};

export const buildThreadMessagesQueryParams = (
  filters: ChatMessageFilters = {},
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.body) params.append("body", filters.body);
  if (filters.body_exact) params.append("body_exact", filters.body_exact);
  if (filters.body_empty !== undefined) {
    params.append("body_empty", filters.body_empty.toString());
  }
  if (filters.status !== undefined)
    params.append("status", filters.status.toString());
  if (filters.seen !== undefined)
    params.append("seen", filters.seen.toString());
  if (filters.sim_slot !== undefined)
    params.append("sim_slot", filters.sim_slot.toString());
  if (filters.date_after) params.append("date_after", filters.date_after);
  if (filters.date_before) params.append("date_before", filters.date_before);
  if (filters.date_range) params.append("date_range", filters.date_range);
  if (filters.created_after)
    params.append("created_after", filters.created_after);
  if (filters.created_before)
    params.append("created_before", filters.created_before);
  if (filters.updated_after)
    params.append("updated_after", filters.updated_after);
  if (filters.updated_before)
    params.append("updated_before", filters.updated_before);
  if (filters.contact) params.append("contact", filters.contact);
  if (filters.contact_name) params.append("contact_name", filters.contact_name);
  if (filters.contact_phone)
    params.append("contact_phone", filters.contact_phone);
  if (filters.address) params.append("address", filters.address);
  if (filters.search) params.append("search", filters.search);
  if (filters.ordering) params.append("ordering", filters.ordering);

  return params;
};

export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else if (diffDays < 365) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } else {
    return date.toLocaleDateString([], { year: "numeric", month: "short" });
  }
};

export const formatConversationDate = (dateString: string): string => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

export const truncateMessage = (
  message: string,
  maxLength: number = 60,
): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength).trim() + "...";
};

export const getContactDisplayName = (thread: MessageThread): string => {
  if (thread.contact?.display_name) return thread.contact.display_name;
  if (thread.contact?.name) return thread.contact.name;
  return thread.address;
};

export const getContactInitials = (name: string): string => {
  const words = name.split(" ").filter((word) => word.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return "NA";
};

export const isPhoneNumber = (address: string): boolean => {
  return /^\+?\d[\d\s\-\(\)]+$/.test(address);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
    )}`;
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
    )}`;
  }

  return phone;
};

export const groupMessagesByDate = (
  messages: Message[],
): ConversationGroup[] => {
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
};

export const getTotalUnreadCount = (threads: MessageThread[]): number => {
  return threads.reduce((total, thread) => total + thread.unread_count, 0);
};

export const getConversationStats = (messages: Message[]) => {
  const sentMessages = messages.filter((msg) => msg.status === 2);
  const receivedMessages = messages.filter((msg) => msg.status === 1);
  const unreadMessages = messages.filter((msg) => !msg.seen);

  return {
    total: messages.length,
    sent: sentMessages.length,
    received: receivedMessages.length,
    unread: unreadMessages.length,
    readPercentage:
      messages.length > 0
        ? ((messages.length - unreadMessages.length) / messages.length) * 100
        : 0,
  };
};

export const filterThreads = (
  threads: MessageThread[],
  query: string,
): MessageThread[] => {
  if (!query.trim()) return threads;

  const searchTerm = query.toLowerCase();
  return threads.filter((thread) => {
    const contactName = getContactDisplayName(thread).toLowerCase();
    const lastMessage = thread.last_message.toLowerCase();
    const address = thread.address.toLowerCase();

    return (
      contactName.includes(searchTerm) ||
      lastMessage.includes(searchTerm) ||
      address.includes(searchTerm)
    );
  });
};

export const sortThreads = (
  threads: MessageThread[],
  sortBy: "date" | "name" | "unread",
): MessageThread[] => {
  const sorted = [...threads];

  switch (sortBy) {
    case "date":
      return sorted.sort(
        (a, b) =>
          new Date(b.last_message_date).getTime() -
          new Date(a.last_message_date).getTime(),
      );
    case "name":
      return sorted.sort((a, b) =>
        getContactDisplayName(a).localeCompare(getContactDisplayName(b)),
      );
    case "unread":
      return sorted.sort((a, b) => b.unread_count - a.unread_count);
    default:
      return sorted;
  }
};

export const searchMessages = (
  messages: Message[],
  query: string,
): Message[] => {
  if (!query.trim()) return messages;

  const searchTerm = query.toLowerCase();
  return messages.filter((message) =>
    message.body.toLowerCase().includes(searchTerm),
  );
};

export const getMessageTypeLabel = (type: number): string => {
  switch (type) {
    case 1:
      return "Received";
    case 2:
      return "Sent";
    default:
      return "Unknown";
  }
};

export const exportToJSON = (threads: MessageThread[], messages: Message[]) => {
  return JSON.stringify(
    {
      export_date: new Date().toISOString(),
      threads_count: threads.length,
      messages_count: messages.length,
      threads,
      messages,
    },
    null,
    2,
  );
};

export const exportToCSV = (messages: Message[]): string => {
  const headers = [
    "ID",
    "Thread ID",
    "Address",
    "Body",
    "Date",
    "Type",
    "Read",
    "Status",
  ];
  const rows = messages.map((msg) => [
    msg.id,
    "N/A",
    "N/A",
    `"${msg.body.replace(/"/g, '""')}"`,
    msg.date,
    getMessageTypeLabel(msg.status),
    msg.seen ? "Yes" : "No",
    msg.status,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};

export const getUniqueContacts = (threads: MessageThread[]) => {
  const contacts = new Map();

  threads.forEach((thread) => {
    if (thread.contact) {
      contacts.set(thread.contact.id, thread.contact);
    } else {
      contacts.set(thread.address, {
        id: thread.address,
        name: thread.address,
        phone_number: thread.address,
        display_name: thread.address,
      });
    }
  });

  return Array.from(contacts.values());
};

export const messageUtils = {
  formatMessageTime,
  formatConversationDate,
  truncateMessage,
  getContactDisplayName,
  getContactInitials,
  isPhoneNumber,
  formatPhoneNumber,
  groupMessagesByDate,
  getTotalUnreadCount,
  filterThreads,
  sortThreads,
  getMessageTypeLabel,
  getConversationStats,
  exportToJSON,
  exportToCSV,
  searchMessages,
  getUniqueContacts,
};

export const getInitials = (name: string): string => {
  if (!name || typeof name !== "string") {
    return "?";
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return "?";
  }

  return trimmedName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
