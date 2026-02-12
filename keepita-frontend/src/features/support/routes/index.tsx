import React, { Suspense } from "react";
import { type RouteObject } from "react-router-dom";
import PrivateRoute from "../../auth/components/PrivateRoute";
import { PageLoader } from "../../../shared/components";

const SupportPage = React.lazy(() => import("../pages/SupportPage"));
const TicketDetailsPage = React.lazy(
  () => import("../pages/TicketDetailsPage"),
);

export const supportRoute: RouteObject[] = [
  {
    path: "/support",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <SupportPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
];

export const ticketDetailsRoute: RouteObject[] = [
  {
    path: "/support/:ticketId",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <TicketDetailsPage />
        </Suspense>
      </PrivateRoute>
    ),
  },
];
