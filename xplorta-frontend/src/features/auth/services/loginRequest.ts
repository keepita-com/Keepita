import { DataProvider } from "../../../core/api/dataProvider";

import {
  AUTH_API_ENDPOINTS,
  type LoginRequest,
  type LoginResponse,
} from "../api/auth.api";

export const loginRequest = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await DataProvider.post<LoginResponse>(
      AUTH_API_ENDPOINTS.LOGIN,
      data
    );

    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "message" in error) {
      throw new Error(error.message as string);
    } else if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Invalid credentials. Please try again.");
    }
  }
};
