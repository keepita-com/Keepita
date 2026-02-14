import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  date_joined?: string;
  email: string;
  first_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  last_login?: string;
  last_name?: string;
  profile_image?: null | string;
}

export interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  preventClear: boolean;
}

interface AuthActions {
  setAuthData: (data: Omit<AuthState, "isLoading" | "preventClear">) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setPreventClear: (prevent: boolean) => void; 
}

export const AUTH_STORAGE_KEY = "keepita_auth";

const initialState: AuthState = {
  user: null,
  access: null,
  refresh: null,
  isAuthenticated: false,
  isLoading: true,
  preventClear: false, 
};

const loadPersistedAuthState = (): AuthState => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

    console.log(
      "Loading auth from localStorage:",
      storedAuth ? "Found" : "Not found",
    );

    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);

      if (parsedAuth && parsedAuth.user && parsedAuth.token) {
        console.log("Valid auth data loaded:", {
          userId: parsedAuth.user.id,
          username: parsedAuth.user.username,
          hasToken: !!parsedAuth.token,
          hasRefresh: !!parsedAuth.refresh,
        });

        return {
          user: parsedAuth.user,
          access: parsedAuth.token,
          refresh:
            typeof parsedAuth.refresh === "object"
              ? parsedAuth.refresh.refresh
              : parsedAuth.refresh,
          isAuthenticated: true,
          isLoading: false,
          preventClear: false,
        };
      }
    }
  } catch (error) {
    console.error("Failed to load auth data from storage:", error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return { ...initialState, isLoading: false };
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...loadPersistedAuthState(),

  setAuthData: (data) => {
    const newState = {
      ...data,
      isAuthenticated: Boolean(data.user && data.access),
      isLoading: false,
      preventClear: false,
    };

    console.log("setAuthData called:", {
      userId: data.user?.id,
      username: data.user?.username,
      hasAccess: !!data.access,
      hasRefresh: !!data.refresh,
    });

    set(newState);

    const storageData = {
      user: data.user,
      refresh: data.refresh,
      token: data.access,
      isAuthenticated: Boolean(data.user && data.access),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storageData));
    console.log("Auth data saved to localStorage");
  },

  updateUser: (user) => {
    const currentUser = get().user;
    if (!currentUser) {
      console.warn("updateUser called but no current user exists");
      return;
    }

    const updatedState = {
      ...get(),
      user: { ...currentUser, ...user },
    };

    set(updatedState);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: updatedState.user,
        token: updatedState.access,
        refresh: updatedState.refresh,
        isAuthenticated: updatedState.isAuthenticated,
      }),
    );

    console.log("User data updated in store and localStorage");
  },

  clearAuth: () => {
    console.trace("clearAuth() called - Stack trace:");

    const currentState = get();

    if (currentState.preventClear) {
      console.warn("clearAuth BLOCKED - preventClear is active");
      console.warn(
        "This prevents accidental logout during impersonation or token refresh",
      );
      return;
    }

    console.log("Clearing auth state:", {
      hadUser: !!currentState.user,
      userId: currentState.user?.id,
      username: currentState.user?.username,
      wasAuthenticated: currentState.isAuthenticated,
    });

    set({ ...initialState, isLoading: false });

    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log("localStorage cleared - key 'keepita_auth' removed");

    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    console.log("Auth cookies cleared");
  },

  setLoading: (isLoading) => {
    console.log(`Auth loading state: ${isLoading}`);
    set({ isLoading });
  },

  setPreventClear: (prevent: boolean) => {
    console.log(`preventClear set to: ${prevent}`);
    set({ preventClear: prevent });
  },
}));

if (import.meta.env.DEV) {
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function (key: string, value: string) {
    if (key === AUTH_STORAGE_KEY) {
      console.log("localStorage.setItem('keepita_auth'):", {
        timestamp: new Date().toISOString(),
        valuePreview: value.slice(0, 100) + "...",
      });
    }
    return originalSetItem.apply(this, [key, value]);
  };

  Storage.prototype.removeItem = function (key: string) {
    if (key === AUTH_STORAGE_KEY) {
      console.trace(
        "localStorage.removeItem('keepita_auth') - Stack trace:",
      );
    }
    return originalRemoveItem.apply(this, [key]);
  };
}
