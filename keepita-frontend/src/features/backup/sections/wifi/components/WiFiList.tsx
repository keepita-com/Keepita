import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { WiFiNetwork } from "../types/wifi.types";
import WiFiItem from "./WiFiItem";

interface WiFiListProps {
  wifiNetworks: WiFiNetwork[];
  isLoading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onWiFiClick?: (wifiNetwork: WiFiNetwork) => void;
  theme?: "Samsung" | "Xiaomi" | "Apple";
}

const WiFiList: React.FC<WiFiListProps> = ({
  wifiNetworks,
  isLoading = false,
  error = null,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onWiFiClick,
  theme = "Samsung",
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  const themes = {
    Samsung: {
      emptyNetworksIconClassNames: "w-8 h-8 text-gray-400",
      emptyNetworkWrapperClassNames:
        "w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4",
    },
    Xiaomi: {
      emptyNetworksIconClassNames: "w-6 h-6 text-orange-600",
      emptyNetworkWrapperClassNames:
        "w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4",
    },
    Apple: {
      emptyNetworksIconClassNames: "w-8 h-8 text-gray-400",
      emptyNetworkWrapperClassNames:
        "w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4",
    },
  };
  const currentTheme = themes[theme];

  if (isLoading && wifiNetworks.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-red-800 font-medium mb-2">
            Error Loading WiFi Networks
          </h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (wifiNetworks.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className={currentTheme.emptyNetworkWrapperClassNames}>
            <svg
              className={currentTheme.emptyNetworksIconClassNames}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          </div>
          <h3 className="text-gray-900 font-medium mb-2">
            No WiFi Networks Found
          </h3>
          <p className="text-gray-500 text-sm">
            No WiFi networks were found in this backup.
          </p>
        </div>
      </div>
    );
  }

  if (theme === "Apple") {
    return (
      <div className="bg-[#E9E9EA] rounded-2xl">
        <AnimatePresence mode="popLayout">
          {wifiNetworks.map((wifiNetwork, index) => (
            <motion.div
              key={wifiNetwork.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <WiFiItem
                theme={theme}
                wifiNetwork={wifiNetwork}
                onClick={onWiFiClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {wifiNetworks.map((wifiNetwork, index) => (
          <motion.div
            key={wifiNetwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <WiFiItem
              theme={theme}
              wifiNetwork={wifiNetwork}
              onClick={onWiFiClick}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading more WiFi networks...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && wifiNetworks.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          You've reached the end of the list
        </div>
      )}
    </div>
  );
};

export default WiFiList;
