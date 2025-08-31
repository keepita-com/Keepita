import React, { Suspense } from "react";
import { type RouteObject } from "react-router-dom";
import PrivateRoute from "../../auth/components/PrivateRoute";
import { PageLoader } from "../../../shared/components";

// Lazy load main backup pages
const BackupLayout = React.lazy(() => import("../pages/BackupLayout"));
const BackupSectionsPage = React.lazy(
  () => import("../pages/BackupSectionsPage")
);

// Lazy load backup section pages
const ContactsPage = React.lazy(
  () => import("../sections/contacts/pages/ContactsPage")
);
const CallLogsPage = React.lazy(
  () => import("../sections/call-logs/pages/CallLogsPage")
);
const MessagesPage = React.lazy(() =>
  import("../sections/messages").then((module) => ({
    default: module.MessagesPage,
  }))
);
const MyFilesPage = React.lazy(() =>
  import("../sections/my-files").then((module) => ({
    default: module.MyFilesPage,
  }))
);
const BluetoothPage = React.lazy(() =>
  import("../sections/bluetooth").then((module) => ({
    default: module.BluetoothPage,
  }))
);
const AppPage = React.lazy(() =>
  import("../sections/apps").then((module) => ({ default: module.AppPage }))
);
const WiFiPage = React.lazy(() =>
  import("../sections/wifi").then((module) => ({ default: module.WiFiPage }))
);
const BrowserPage = React.lazy(
  () => import("../sections/browser/pages/BrowserPage")
);

export const backupDetailsRoute: RouteObject[] = [
  {
    path: "/backups/:backupId",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <BackupSectionsPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/contacts",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <ContactsPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/call-logs",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <CallLogsPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/messages",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <MessagesPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/files",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <MyFilesPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/bluetooth",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <BluetoothPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/apps",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <AppPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/wifi",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <WiFiPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
  {
    path: "/backups/:backupId/browser",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <BrowserPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
];

export const backupRoutes: RouteObject[] = [
  {
    path: "/backups",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <BackupLayout />
        </Suspense>
      </PrivateRoute>
    ),
  },
];
