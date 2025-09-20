import React, { Suspense } from "react";
import type { RouteObject } from "react-router-dom";

import { PageLoader } from "../../shared/components";
import { homeRoutes } from "../../features/home/routes/index";
import authRoutes from "../../features/auth/routes/index";
import {
  backupDetailsRoute,
  backupRoutes,
} from "../../features/backup/routes/index";
import BackupToastProcessor from "../../features/backup/components/backupProgressToast/BackupToastProcessor";
import notificationsRoutes from "../../features/notifications/routes";

// Lazy load the main layout
const MainLayout = React.lazy(
  () => import("../../features/layout/pages/MainLayout")
);

export const routes: RouteObject[] = [
  ...authRoutes,
  ...backupDetailsRoute,

  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <BackupToastProcessor />
        <MainLayout />
      </Suspense>
    ),
    children: [
      ...homeRoutes,
      ...backupRoutes,
      ...notificationsRoutes,
    ],
  },
];

export const getRoutes = (): RouteObject[] => {
  return routes;
};
