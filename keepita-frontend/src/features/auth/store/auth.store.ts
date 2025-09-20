import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  date_joined: string;
  email: string;
  first_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string;
  last_name: string;
  profile_image: null | string;
}

export interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuthData: (data: Omit<AuthState, "isLoading">) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const AUTH_STORAGE_KEY = "xplorta_auth";

const initialState: AuthState = {
  user: null,
  access: null,
  refresh: null,
  isAuthenticated: false,
  isLoading: true,
};

const loadPersistedAuthState = (): AuthState => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);

      if (parsedAuth && parsedAuth.user && parsedAuth.token) {
        return {
          user: parsedAuth.user,
          access: parsedAuth.token,
          refresh: parsedAuth,
          isAuthenticated: true,
          isLoading: false,
        };
      }
    }
  } catch (error) {
    console.error("Failed to load auth data from storage:", error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return {
    ...initialState,
    isLoading: false,
  };
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...loadPersistedAuthState(),

  setAuthData: (data) => {
    const newState = {
      ...data,
      isAuthenticated: Boolean(data.user && data.access),
      isLoading: false,
    };
    set(newState);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: data.user,
        refresh: data.refresh,
        token: data.access,
        isAuthenticated: Boolean(data.user && data.access),
      })
    );
  },

  updateUser: (user) => {
    const currentUser = get().user;

    if (!currentUser) return;

    const updatedState = {
      ...get(),
      user: {
        ...currentUser,
        ...user,
      },
    };

    set(updatedState);

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: updatedState.user,
        token: updatedState.access,
        isAuthenticated: updatedState.isAuthenticated,
      })
    );
  },

  clearAuth: () => {
    set({
      ...initialState,
      isLoading: false,
    });

    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);

    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },
}));
