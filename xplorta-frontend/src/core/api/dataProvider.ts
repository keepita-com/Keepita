import type { ApiResponse } from "../types/apiResponse";
import type { CustomizedAxiosConfig } from "../types/axiosInstance";

import { axiosInstance } from "../config/axiosInstance";

export class DataProvider {
  static async get<ResponseT>(
    url: string,
    config?: CustomizedAxiosConfig
  ): Promise<ApiResponse<ResponseT>> {
    const response = axiosInstance.get<ApiResponse<ResponseT>>(url, config);
    return (await response).data;
  }

  static async post<ResponseT, RequestT = unknown>(
    url: string,
    data?: RequestT,
    config?: CustomizedAxiosConfig
  ): Promise<ApiResponse<ResponseT>> {
    const response = axiosInstance.post<ApiResponse<ResponseT>>(
      url,
      data,
      config
    );

    return (await response).data;
  }

  static async patch<ResponseT, RequestT = unknown>(
    url: string,
    data?: RequestT,
    config?: CustomizedAxiosConfig
  ): Promise<ApiResponse<ResponseT>> {
    const response = axiosInstance.patch<ApiResponse<ResponseT>>(
      url,
      data,
      config
    );
    return (await response).data;
  }

  static async delete<ResponseT>(
    url: string,
    config?: CustomizedAxiosConfig
  ): Promise<ApiResponse<ResponseT>> {
    const response = axiosInstance.delete<ApiResponse<ResponseT>>(url, config);
    return (await response).data;
  }

  static async download(
    url: string,
    config?: CustomizedAxiosConfig
  ): Promise<Blob> {
    const response = axiosInstance<Blob>(url, {
      responseType: "blob",
      ...config,
    });
    return (await response).data;
  }
}
