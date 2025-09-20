/**
 * Route preloading utilities for better UX
 * These functions help preload components when users hover over navigation items
 */

// Preload functions for each major route group
export const preloadAuthRoutes = () => {
  import("../../features/auth/pages/LoginPage");
  import("../../features/auth/pages/RegisterPage");
  import("../../features/auth/pages/ProfilePage");
};

export const preloadBackupRoutes = () => {
  import("../../features/backup/pages/BackupLayout");
  import("../../features/backup/pages/BackupSectionsPage");
};

export const preloadBackupSections = () => {
  import("../../features/backup/sections/contacts/pages/ContactsPage");
  import("../../features/backup/sections/call-logs/pages/CallLogsPage");
  import("../../features/backup/sections/browser/pages/BrowserPage");
  import("../../features/backup/sections/messages").then(
    (module) => module.MessagesPage
  );
  import("../../features/backup/sections/my-files").then(
    (module) => module.MyFilesPage
  );
  import("../../features/backup/sections/bluetooth").then(
    (module) => module.BluetoothPage
  );
  import("../../features/backup/sections/apps").then(
    (module) => module.AppPage
  );
  import("../../features/backup/sections/wifi").then(
    (module) => module.WiFiPage
  );
};

export const preloadHomeRoute = () => {
  import("../../features/home/pages/HomePage");
};

export const preloadLayoutComponents = () => {
  import("../../features/layout/pages/MainLayout");
};

// Preload critical routes on app initialization
export const preloadCriticalRoutes = () => {
  // Preload the most commonly accessed routes
  preloadHomeRoute();
  preloadBackupRoutes();
  preloadLayoutComponents();
};
