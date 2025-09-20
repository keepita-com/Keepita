import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./core/router/AppRouter";
import { queryClient } from "./core/config/queryClient";
import { AuthInitializer } from "./features/auth/components/AuthInitializer";
import { preloadCriticalRoutes } from "./core/router/routePreloader";
import { Toaster } from "react-hot-toast";
import { Toaster as SoonerToaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/react";

function App() {
  // Preload critical routes after initial render
  React.useEffect(() => {
    // Delay preloading to not interfere with initial load
    const timer = setTimeout(() => {
      preloadCriticalRoutes();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <AuthInitializer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              overflow: "hidden",
              background: "#1e2939",
            },
          }}
        />
        <SoonerToaster position="bottom-left" richColors />
        <AppRouter />
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default App;
