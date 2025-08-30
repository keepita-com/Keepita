const AUTH_STORAGE_KEY = "xplorta_auth";

export const getAuthToken = (): string | undefined => {
  try {
    const authData = JSON.parse(
      localStorage.getItem(AUTH_STORAGE_KEY) || "null"
    );
    if (authData?.isAuthenticated) {
      return `Bearer ${authData.token}`;
    }
    if (authData && !authData.isAuthenticated) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Error parsing user data", e);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return;
};
