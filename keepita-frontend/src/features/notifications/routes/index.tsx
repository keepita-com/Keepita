import React, { Suspense } from "react";

import type { RouteObject } from "react-router-dom";

import { PageLoader } from "../../../shared/components";

const NotificationsPage = React.lazy(
  () => import("../pages/notificationsPage")
);

const notificationsRoutes: RouteObject[] = [
  {
    path: "notifications",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotificationsPage />
      </Suspense>
    ),
  },
];

export default notificationsRoutes;
