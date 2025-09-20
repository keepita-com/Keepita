import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { getRoutes } from "./routes";

const AppRoutes: React.FC = () => {
  const element = useRoutes(getRoutes());
  return element;
};

export const AppRouter: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <BrowserRouter>
      {children}
      <AppRoutes />
    </BrowserRouter>
  );
};
