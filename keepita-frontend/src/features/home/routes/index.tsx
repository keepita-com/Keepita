import React, { Suspense } from "react";
import { type RouteObject } from "react-router-dom";
import { PageLoader } from "../../../shared/components";

const HomePage = React.lazy(() => import("../pages/HomePage"));

export const homeRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <HomePage />
      </Suspense>
    ),
    index: true,
  },
];

export const homeRootRoute: RouteObject = {
  path: "/",
  children: homeRoutes,
};
