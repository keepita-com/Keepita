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

    config.headers.Authorization = getAuthToken();
    config.headers["Accept-Language"] = getLanguage();

    return config;
  });

  axiosInstance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError<ApiResponse<null>>) => {
      const config = err.config as CustomizedAxiosConfig;

      // retry limit check
      if (!config._retryCount || config._retryCount <= 0) {
        throw new ApiResponseConstructor(
          getResponseMessage(err),
          {} as unknown,
          false
        );
      }

      // token exp check
      if (
        err.response &&
        [401, 403].includes(err.response.status) &&
        err.response?.data?.message === EXPIRED_TOKEN_MESSAGE &&
        err?.config?.url !== AUTH_API_ENDPOINTS.REFRESH_TOKEN
      ) {
        config._retryCount--;
        const { refresh, setAuthData, clearAuth } = useAuthStore.getState();

        failedQueue.push(() => axiosInstance(config));

        if (!refreshTokenPromise) {
          refreshTokenPromise = getNewJWTToken(refresh!)
            .then((res) => {
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
                })
              );

              return res.access;
            })
            .catch((error) => {
              failedQueue.length = 0;
              clearAuth();

              throw new ApiResponseConstructor(
                getResponseMessage(error),
                {} as unknown,
                false
              );
            })
            .finally(clearPromise);
        }

        const newAccessToken = await refreshTokenPromise;

        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        await Promise.allSettled(failedQueue.map((retry) => retry()));
        failedQueue.length = 0;
      } else {
        throw new ApiResponseConstructor(
          getResponseMessage(err),
          {} as unknown,
          false
        );
      }
    }
  );
}
