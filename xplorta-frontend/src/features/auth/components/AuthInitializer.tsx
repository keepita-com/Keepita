import React from "react";
import { useAuth } from "../hooks/auth.hooks";

export const AuthInitializer: React.FC = () => {
  useAuth();

  return null;
};
