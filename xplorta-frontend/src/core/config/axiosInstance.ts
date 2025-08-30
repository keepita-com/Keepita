import axios from "axios";

import { getApiUrl } from "../api/config";
import { setupAxiosInterceptors } from "../utils/setupAxiosInterceptors";

export const axiosInstance = axios.create({
  baseURL: getApiUrl(),
});

setupAxiosInterceptors(axiosInstance);
