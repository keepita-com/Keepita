import type { AxiosInstance, AxiosRequestConfig } from "axios";

export interface CustomizedAxiosConfig extends AxiosRequestConfig {
  _retryCount?: number;
  params?: {
    ordering?: string | null;
    page?: number | null | string;
    search?: string | null;
    page_size?: number | null;
    date?: { [key: string]: { from?: Date; to?: Date } } | null;
    [key: string]: unknown;
  };
}

export type RetryFn = () => Promise<AxiosInstance>;
