import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth.hooks";

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
