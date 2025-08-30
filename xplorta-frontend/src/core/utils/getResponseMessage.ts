import axios from "axios";

import type { ApiResponse } from "../types/apiResponse";

export default function getResponseMessage(error: unknown) {
  if (axios.isAxiosError<ApiResponse<null>>(error))
    return (
      error?.response?.data?.message ??
      error?.message ??
      "An error accured while performing action."
    );

  return "An unexpected error occurred.";
}
