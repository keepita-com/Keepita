import { type User } from "../store";
import { DataProvider } from "../../../core/api/dataProvider";
import type { JWTToken } from "../types/auth.types";
const RESOURCE = "auth";

export const AUTH_API_ENDPOINTS = {
  LOGIN: `${RESOURCE}/login/`,
  REGISTER: `${RESOURCE}/registration/`,
  USER_PROFILE: `user/`,
  VERIFY_TOKEN: `${RESOURCE}/token/verify/`,
  REFRESH_TOKEN: `/token/refresh/`,
};

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  refresh: string;
  access: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export type UpdateUserProfileRespone = { user: User };

export const useAuthApi = () => {
  const registerRequest = async (data: RegisterRequest): Promise<null> => {
    try {
      await DataProvider.post(AUTH_API_ENDPOINTS.REGISTER, data);

      return null;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  };

  const updateUserProfile = async <T extends Record<string, any>>(data: T) => {
    try {
      const endpoint = `${AUTH_API_ENDPOINTS.USER_PROFILE}profile/`;
      const response = await DataProvider.patch<{ user: User }>(endpoint, data);

      return response.data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw new Error(error.message as string);
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Failed to update profile. Please try again.");
      }
    }
  };

  return {
    registerRequest,
    updateUserProfile,
  };
};

export async function getNewJWTToken(refreshToken: string) {
  const response = await DataProvider.post<JWTToken>(
    AUTH_API_ENDPOINTS.REFRESH_TOKEN,
    { refresh: refreshToken }
  );

  return response.data;
}

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    await DataProvider.post(AUTH_API_ENDPOINTS.VERIFY_TOKEN, {
      token,
    });

    return true;
  } catch {
    return false;
  }
};
