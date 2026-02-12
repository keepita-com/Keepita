import { AxiosError, type AxiosInstance } from "axios";
import { AUTH_STORAGE_KEY, useAuthStore } from "../../features/auth/store";
import type { CustomizedAxiosConfig, RetryFn } from "../types/axiosInstance";
import { ApiResponseConstructor, type ApiResponse } from "../types/apiResponse";
import { getAuthToken } from "./getAuthToken";
import { getLanguage } from "./getLanguage";
import {
  AUTH_API_ENDPOINTS,
  getNewJWTToken,
} from "../../features/auth/api/auth.api";
import getResponseMessage from "./getResponseMessage";

let refreshTokenPromise: Promise<string | void> | null = null;
const failedQueue: RetryFn[] = [];
const clearPromise = () => (refreshTokenPromise = null);
const DEFAULT_MAX_RETRIES = 3;
const EXPIRED_TOKEN_MESSAGE = "TOKEN_EXPIRED";

export function setupAxiosInterceptors(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use((config) => {
    const req = config as CustomizedAxiosConfig;

    if (!req._retryCount) {
      req._retryCount = DEFAULT_MAX_RETRIES;
    }

    const isRefreshRequest =
      config.url === AUTH_API_ENDPOINTS.REFRESH_TOKEN ||
      config.url?.includes("/token/refresh/");

    if (isRefreshRequest) {
      delete config.headers.Authorization;
      delete config.headers["Authorization"];
    } else {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = token;
      }
    }

    config.headers["Accept-Language"] = getLanguage();

    return config;
  });

  axiosInstance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError<ApiResponse<null>>) => {
      const config = err.config as CustomizedAxiosConfig;

      if (!config || !config._retryCount || config._retryCount <= 0) {
        return Promise.reject(
          new ApiResponseConstructor(
            getResponseMessage(err),
            {} as unknown,
            false,
          ),
        );
      }

      const isAuthError =
        err.response &&
        (err.response.status === 401 || err.response.status === 403);

      const isRefreshUrl =
        config.url === AUTH_API_ENDPOINTS.REFRESH_TOKEN ||
        config.url?.includes("/token/refresh/");

      if (
        isAuthError &&
        !isRefreshUrl &&
        (err.response?.data?.message === EXPIRED_TOKEN_MESSAGE ||
          err.response?.status === 401)
      ) {
        config._retryCount--;
        console.log("Token expired - attempting refresh...");

        const { refresh, setAuthData, clearAuth } = useAuthStore.getState();

        if (!refresh) {
          console.error("No refresh token available - logging out");
          clearAuth();
          return Promise.reject(err);
        }

        failedQueue.push(() => axiosInstance(config));

        if (!refreshTokenPromise) {
          refreshTokenPromise = getNewJWTToken(refresh)
            .then((res) => {
              console.log("Token refresh successful");

              setAuthData({
                user: res.user,
                access: res.access,
                refresh: res.refresh,
                isAuthenticated: true,
              });

              localStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({
                  user: res.user,
                  refresh: res.refresh,
                  token: res.access,
                  isAuthenticated: true,
                }),
              );

              return res.access;
            })
            .catch((error: AxiosError) => {
              console.error("Token refresh failed:", error);

              const status = error.response?.status;
              const isRefreshTokenInvalid =
                status === 401 || status === 403 || status === 400;

              if (isRefreshTokenInvalid) {
                console.error(
                  "Refresh token is invalid/expired - logging out.",
                );
                failedQueue.length = 0;
                clearAuth();
              } else {
                console.warn(
                  "Refresh network/server error - keeping session.",
                );
                failedQueue.length = 0;
              }

              return Promise.reject(error);
            })
            .finally(clearPromise);
        }

        return refreshTokenPromise
          .then((newAccessToken) => {
            if (!newAccessToken)
              return Promise.reject(new Error("No token returned"));

            if (!config.headers) {
              config.headers = {};
            }

            config.headers.Authorization = `Bearer ${newAccessToken}`;

            return Promise.allSettled(failedQueue.map((retry) => retry())).then(
              () => axiosInstance(config),
            );
          })
          .catch((refreshErr) => {
            return Promise.reject(refreshErr);
          });
      }

      return Promise.reject(
        new ApiResponseConstructor(
          getResponseMessage(err),
          {} as unknown,
          false,
        ),
      );
    },
  );
}
