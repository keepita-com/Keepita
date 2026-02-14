import { useEffect } from "react";
import { useAuthStore } from "../store";
export const useAuth = () => {
  const authStore = useAuthStore();
  const { user, access, isAuthenticated } = authStore;

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("useAuth - Current State:", {
        hasUser: !!user,
        userId: user?.id,
        username: user?.username,
        hasAccessToken: !!access,
        tokenPreview: access ? `${access.slice(0, 20)}...` : null,
        isAuthenticated,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user, access, isAuthenticated]);
  
  return authStore;
};
