import { DataProvider } from "../../../core/api/dataProvider";

import type {
  ActivateLicensePayload,
  ActivateLicenseRawResponse,
  LicenseListRawResponse,
} from "../types/license.types";

const LICENSE_ENDPOINT_BASE_URL = {
  list: "/license/list/",
  activate: (id: ActivateLicensePayload["licenseId"]) =>
    `/license/activate/${id}`,
} as const;

export const getLicenseList = async () => {
  const response = await DataProvider.get<LicenseListRawResponse>(
    LICENSE_ENDPOINT_BASE_URL.list
  );

  return response;
};

export const activateLicense = async ({
  licenseId,
  userId,
}: ActivateLicensePayload) => {
  const response = await DataProvider.post<ActivateLicenseRawResponse>(
    LICENSE_ENDPOINT_BASE_URL.activate(licenseId),
    userId
  );

  return response;
};
