import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  ActivateLicensePayload,
  ActivateLicenseResponse,
  LicenseListResponse,
} from "../types/license.types";
import { activateLicense, getLicenseList } from "../api/license.api";

export const useActivateLicense = () => {
  return useMutation<ActivateLicenseResponse, Error, ActivateLicensePayload>({
    mutationFn: activateLicense,
  });
};

export const useLicenseList = () => {
  return useQuery<LicenseListResponse>({
    queryKey: ["license", "list"],
    queryFn: getLicenseList,
  });
};
