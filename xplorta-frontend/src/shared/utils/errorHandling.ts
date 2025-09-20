import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export type ErrorType = 
  | "NETWORK"
  | "SERVER" 
  | "UNAUTHORIZED" 
  | "FORBIDDEN" 
  | "NOT_FOUND" 
  | "VALIDATION" 
  | "UNKNOWN";

export const ErrorTypes = {
  NETWORK: "NETWORK" as ErrorType,
  SERVER: "SERVER" as ErrorType,
  UNAUTHORIZED: "UNAUTHORIZED" as ErrorType,
  FORBIDDEN: "FORBIDDEN" as ErrorType,
  NOT_FOUND: "NOT_FOUND" as ErrorType,
  VALIDATION: "VALIDATION" as ErrorType,
  UNKNOWN: "UNKNOWN" as ErrorType,
};

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  validationErrors?: Record<string, string[]>;
}


export const handleApiError = (error: AxiosError): AppError => {
  if (error.response) {
    const { response } = error;
    
    switch (response.status) {
      case 401:
        return {
          type: ErrorTypes.UNAUTHORIZED,
          message: "You are not authenticated. Please log in.",
          originalError: error,
        };
      case 403:
        return {
          type: ErrorTypes.FORBIDDEN,
          message: "You do not have permission to perform this action.",
          originalError: error,
        };
      case 404:
        return {
          type: ErrorTypes.NOT_FOUND,
          message: "The requested resource was not found.",
          originalError: error,
        };
      case 422:
        return {
          type: ErrorTypes.VALIDATION,
          message: "Validation error. Please check your input.",
          validationErrors: (response.data as ApiErrorResponse)?.errors || {},
          originalError: error,
        };
      default:
        return {
          type: ErrorTypes.UNKNOWN,
          message: (response.data as ApiErrorResponse)?.message || "An unknown error occurred.",
          originalError: error,
        };
    }
  }
  
  if (error.request) {
    return {
      type: ErrorTypes.NETWORK,
      message: "Network error. Please check your connection.",
      originalError: error,
    };
  }
  
  return {
    type: ErrorTypes.UNKNOWN,
    message: "An unknown error occurred.",
    originalError: error,
  };
};


export const getValidationErrorMessage = (
  fieldName: string,
  validationErrors?: Record<string, string[]>
): string | undefined => {
  if (!validationErrors || !validationErrors[fieldName]) {
    return undefined;
  }

  return validationErrors[fieldName][0];
};
