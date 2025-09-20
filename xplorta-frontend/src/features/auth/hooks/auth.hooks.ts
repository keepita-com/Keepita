import { useEffect } from "react";

import { useAuthStore } from "../store";

import { verifyToken } from "../api/auth.api";

export const useAuth = () => {
  const authStore = useAuthStore();
  const { user, access, clearAuth } = authStore;

  useEffect(() => {
    const validateAuthState = async () => {
      if (user && access) {
        try {
          const isValid = await verifyToken(access);

          if (!isValid) {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      }
    };

    validateAuthState();
  }, [user, access, clearAuth]);

  return authStore;
};
