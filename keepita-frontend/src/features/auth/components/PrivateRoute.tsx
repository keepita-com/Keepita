import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth.hooks";
import { PageLoader } from "../../../shared/components";

interface PrivateRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  redirectTo = "/login",
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
