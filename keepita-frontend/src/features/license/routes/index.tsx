import React, { Suspense } from "react";

import { type RouteObject } from "react-router-dom";

import PrivateRoute from "@/features/auth/components/PrivateRoute";

import { PageLoader } from "../../../shared/components";

const PlansPage = React.lazy(() => import("../pages/LicensePage"));

const plansRoutes: RouteObject[] = [
  {
    path: "/plans",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <PlansPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
];

export default plansRoutes;
