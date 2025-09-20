/**
 * @param url - The full URL string
 * @returns A cleaned, more readable version of the URL
 */
export const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.replace(/^www\./, "");
    if (hostname.length > 30) {
      hostname = hostname.substring(0, 27) + "...";
    }
    return hostname;
  } catch (e) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
};

/**
 * @param dateString - An ISO 8601 date string
 * @returns A human-readable relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diffSeconds < minute) {
    return "just now";
  } else if (diffSeconds < hour) {
    return `${Math.floor(diffSeconds / minute)}m ago`;
  } else if (diffSeconds < day) {
    return `${Math.floor(diffSeconds / hour)}h ago`;
  } else if (diffSeconds < week) {
    return `${Math.floor(diffSeconds / day)}d ago`;
  } else if (diffSeconds < month) {
    return `${Math.floor(diffSeconds / week)}w ago`;
  } else if (diffSeconds < year) {
    return `${Math.floor(diffSeconds / month)}mo ago`;
  } else {
    return `${Math.floor(diffSeconds / year)}y ago`;
  }
};

/**
 * @param bytes - Size in bytes
 * @returns A human-readable file size string (e.g., "1.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/**
 * @param url - The URL of the website
 * @returns A URL to the Google favicon service
 */
export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch (error) {
    return "https://placehold.co/64x64/F2F2F7/8E8E93?text=?";
  }
};

/**
 * @param tab - The browser tab type
 * @returns Sort options for the specific tab
 */
export const getSortOptionsForTab = (tab: string) => {
  const options = [
    {
      value: "title",
      label: "Title (A-Z)",
      field: "title",
      direction: "asc" as const,
    },
    {
      value: "-title",
      label: "Title (Z-A)",
      field: "title",
      direction: "desc" as const,
    },
  ];

  switch (tab) {
    case "Bookmarks":
      return [
        {
          value: "-created_at",
          label: "Date Added (Newest)",
          field: "created_at",
          direction: "desc" as const,
        },
        {
          value: "created_at",
          label: "Date Added (Oldest)",
          field: "created_at",
          direction: "asc" as const,
        },
        ...options,
        {
          value: "-updated_at",
          label: "Last Updated",
          field: "updated_at",
          direction: "desc" as const,
        },
      ];
    case "History":
      return [
        {
          value: "-last_visit_time",
          label: "Last Visited (Most Recent)",
          field: "last_visit_time",
          direction: "desc" as const,
        },
        {
          value: "last_visit_time",
          label: "Last Visited (Oldest)",
          field: "last_visit_time",
          direction: "asc" as const,
        },
        {
          value: "-visit_count",
          label: "Most Visited",
          field: "visit_count",
          direction: "desc" as const,
        },
        {
          value: "visit_count",
          label: "Least Visited",
          field: "visit_count",
          direction: "asc" as const,
        },
        ...options,
      ];
    case "Downloads":
      return [
        {
          value: "-download_time",
          label: "Download Date (Newest)",
          field: "download_time",
          direction: "desc" as const,
        },
        {
          value: "download_time",
          label: "Download Date (Oldest)",
          field: "download_time",
          direction: "asc" as const,
        },
        {
          value: "-bytes_downloaded",
          label: "Size (Largest First)",
          field: "bytes_downloaded",
          direction: "desc" as const,
        },
        {
          value: "bytes_downloaded",
          label: "Size (Smallest First)",
          field: "bytes_downloaded",
          direction: "asc" as const,
        },
        {
          value: "file_name",
          label: "File Name (A-Z)",
          field: "file_name",
          direction: "asc" as const,
        },
        {
          value: "-file_name",
          label: "File Name (Z-A)",
          field: "file_name",
          direction: "desc" as const,
        },
      ];
    case "Searches":
      return [
        {
          value: "-search_time",
          label: "Search Date (Newest)",
          field: "search_time",
          direction: "desc" as const,
        },
        {
          value: "search_time",
          label: "Search Date (Oldest)",
          field: "search_time",
          direction: "asc" as const,
        },
        {
          value: "search_term",
          label: "Search Term (A-Z)",
          field: "search_term",
          direction: "asc" as const,
        },
        {
          value: "-search_term",
          label: "Search Term (Z-A)",
          field: "search_term",
          direction: "desc" as const,
        },
      ];
    case "Tabs":
      return [
        {
          value: "-last_accessed",
          label: "Last Accessed (Most Recent)",
          field: "last_accessed",
          direction: "desc" as const,
        },
        {
          value: "last_accessed",
          label: "Last Accessed (Oldest)",
          field: "last_accessed",
          direction: "asc" as const,
        },
        ...options,
      ];
    default:
      return options;
  }
};

/**
 * @param tab - The browser tab type
 * @returns Search placeholder text
 */
export const getSearchPlaceholderForTab = (tab: string): string => {
  switch (tab) {
    case "Bookmarks":
      return "Search bookmarks...";
    case "History":
      return "Search browsing history...";
    case "Downloads":
      return "Search downloads...";
    case "Searches":
      return "Search search queries...";
    case "Tabs":
      return "Search open tabs...";
    default:
      return "Search...";
  }
};
