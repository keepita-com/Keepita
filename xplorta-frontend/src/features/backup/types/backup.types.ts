export type BackupsStatsResponse = {
  total_backups: number;
  total_size_bytes: number;
  completed_backups: number;
  failed_backups: number;
};

export type BackupMediaResponse = {
  download_url: string;
};
