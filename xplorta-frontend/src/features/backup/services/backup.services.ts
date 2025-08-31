import { useQuery } from "@tanstack/react-query";

import type {
  BackupsStatsResponse
} from "../types/backup.types";

import { getBackupsStats } from "../api/backup.api";

export const useBackupsStats = () => {
  return useQuery<BackupsStatsResponse>({
    queryKey: ["user", "backups", "stats"],
    queryFn: getBackupsStats,
  });
};
