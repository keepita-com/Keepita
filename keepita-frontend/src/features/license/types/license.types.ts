import type { LucideIcon } from "lucide-react";

import type { ApiResponse } from "../../../core/types/apiResponse";
import type { User } from "../../auth/store";

export type License = {
  id: number;
  name: string;
  description: string;
  features: string[];
  price: string;
};

type GetResponseData<T extends ApiResponse<unknown>> = T["data"];

export type ActivateLicenseResponse = ApiResponse<[]>;
export type ActivateLicenseRawResponse =
  GetResponseData<ActivateLicenseResponse>;

export type ActivateLicensePayload = {
  licenseId: License["id"];
  userId: User["id"];
};

export type LicenseListResponse = ApiResponse<License[]>;
export type LicenseListRawResponse = GetResponseData<LicenseListResponse>;

export interface LicenseInfoCardProps {
  license: License & {
    icon: LucideIcon;
    buttonText: string;
    buttonClass: string;
  };
}
