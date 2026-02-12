import React, { Suspense } from "react";
import { type RouteObject } from "react-router-dom";
import { PageLoader } from "../../../shared/components";
import PrivateRoute from "../components/PrivateRoute";

const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const ProfilePage = React.lazy(() => import("../pages/ProfilePage"));
const VerifyTokenPage = React.lazy(() => import("../pages/VerifyTokenPage"));

const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: "/auth/verify-token",
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyTokenPage />
      </Suspense>
    ),
  },
  {
    path: "profile",
    element: (
      <PrivateRoute>
        <Suspense fallback={<PageLoader />}>
          <ProfilePage />
        </Suspense>
      </PrivateRoute>
    ),
  },
];

export default authRoutes;
