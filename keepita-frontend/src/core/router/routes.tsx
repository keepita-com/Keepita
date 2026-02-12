import React, { Suspense } from "react";
import { Navigate, type RouteObject } from "react-router-dom";

import { PageLoader } from "../../shared/components";
import { homeRoutes } from "../../features/home/routes/index";
import authRoutes from "../../features/auth/routes/index";
import {
  backupDetailsRoute,
  backupRoutes,
} from "../../features/backup/routes/index";
import plansRoutes from "../../features/license/routes";
import BackupToastProcessor from "../../features/backup/components/backupProgressToast/BackupToastProcessor";
import notificationsRoutes from "../../features/notifications/routes";
import { supportRoute, ticketDetailsRoute } from "@/features/support/routes";

import PrivateRoute from "../../features/auth/components/PrivateRoute";

const MainLayout = React.lazy(
  () => import("../../features/layout/pages/MainLayout"),
);

export const routes: RouteObject[] = [
  ...authRoutes,
  ...backupDetailsRoute,
  ...ticketDetailsRoute,
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <BackupToastProcessor />
          <MainLayout />
        </Suspense>
      </PrivateRoute>
    ),
    children: [
      ...homeRoutes,
      ...backupRoutes,
      ...plansRoutes,
      ...notificationsRoutes,
      ...supportRoute,
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export const getRoutes = (): RouteObject[] => {
  return routes;
};
