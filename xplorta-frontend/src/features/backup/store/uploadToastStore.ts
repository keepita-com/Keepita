import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BACKUP_UPLOAD_PROGRESS_CONFIG } from "../constants/backupUploadToast";

type State = {
  [BACKUP_UPLOAD_PROGRESS_CONFIG.backupProgressIdStorageKey]: string | null;
};

type Action = {
  setBackupCreationId: (id: State["backupCreationId"] | undefined) => void;
};

type BackupProcessIdStore = State & Action;

export const useBackupToastStore = create<BackupProcessIdStore>()(
  persist(
    (set) => ({
      backupCreationId: null,
      setBackupCreationId: (id) => {
        set({ backupCreationId: id });
      },
    }),
    { name: "backupToast" }
  )
);
