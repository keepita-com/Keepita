import { DataProvider } from "../../../../../core/api/dataProvider";
import type {
  ContactsResponse,
  GetContactsParams,
} from "../types/contact.types";
import { buildContactsQueryParams } from "../utils/contact.utils";

const RESOURCE = "dashboard";

const CONTACT_API_ENDPOINTS = {
  CONTACTS: (backupId: number) => `${RESOURCE}/backups/${backupId}/contacts/`,
} as const;

/**
 * Get contacts for a specific backup with optional filtering and pagination
 */
export const getContacts = async (
  backupId: number | string | undefined,
  params: Partial<GetContactsParams> = {}
): Promise<ContactsResponse> => {
  if (!backupId) {
    throw new Error("Backup ID is required");
  }

  const numericBackupId =
    typeof backupId === "string" ? parseInt(backupId, 10) : backupId;

  if (isNaN(numericBackupId)) {
    throw new Error("Invalid backup ID");
  }

  const queryParams = buildContactsQueryParams(params);
  const endpoint = CONTACT_API_ENDPOINTS.CONTACTS(numericBackupId);

  try {
    const response = await DataProvider.get<ContactsResponse>(endpoint, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};