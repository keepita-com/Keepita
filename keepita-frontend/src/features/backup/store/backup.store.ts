import { create } from "zustand";

import type { BackupFilters } from "../components/SearchAndFilterBar";
import type { UploadPhaseUnion } from "../hooks/backup.hooks";

export interface BackupItem {
  id: number;
  name: string;
  size: number;
  created_at: string;
  updated_at: string;
  status: "completed" | "processing" | "failed";
  model_name: string;
  pin: string | null;
  user: number;
  contacts_count: number;
  messages_count: number;
  call_logs_count: number;
  apps_count: number;
  files_count: number;
  wifi_networks_count: number;
  bluetooth_devices_count: number;
  alarms_count: number;
  home_screen_items_count: number;
  browser_count: number;
  wallpapers_count: number;
}

export interface BackupStats {
  totalSize: number;
  count: number;
  lastBackupDate: string | null;
  autoBackupsEnabled: boolean;
}

type SortConfig = {
  field: string;
  direction: "desc" | "asc";
};

export interface BackupState {
  backups: BackupItem[];
  isLoading: boolean;
  selectedBackup: BackupItem | null;
  backupInProgress: boolean;
  // filters
  searchQuery: string;
  filters: BackupFilters;
  sortConfig: SortConfig;
  deletingId: number | null;
  showCreateForm: boolean;
  backupCreationLogId: string | undefined;
  uploadPhase: UploadPhaseUnion;
  uploadToastId: string | undefined;
}

interface BackupActions {
  setBackups: (backups: BackupItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  selectBackup: (backup: BackupItem | null) => void;
  setBackupInProgress: (inProgress: boolean) => void;
  addBackup: (backup: BackupItem) => void;
  removeBackup: (id: number | string) => void;
  updateBackup: (id: number | string, data: Partial<BackupItem>) => void;
  // filters
  setSearchQuery: (query: BackupState["searchQuery"]) => void;
  setFilters: (filters: BackupFilters) => void;
  setSortConfig: (conf: SortConfig) => void;
  setDeletingId: (id: BackupState["deletingId"]) => void;
  setShowCreateForm: (state: BackupState["showCreateForm"]) => void;
  setBackupCreationLogId: (id: BackupState["backupCreationLogId"]) => void;
  setUploadPhase: (phase: BackupState["uploadPhase"]) => void;
  setUploadToastId: (id: BackupState["uploadToastId"]) => void;
}

// const BACKUP_STORAGE_KEY = "xplorta_backup_settings";

const initialState: BackupState = {
  backups: [],
  isLoading: false,
  selectedBackup: null,
  backupInProgress: false,
  // filters
  searchQuery: "",
  filters: {
    status: null,
    customDateFrom: undefined,
    customDateTo: undefined,
  },
  sortConfig: {
    field: "created_at",
    direction: "desc" as "asc" | "desc",
  },
  deletingId: null,
  showCreateForm: false,
  backupCreationLogId: undefined,
  uploadPhase: "idle",
  uploadToastId: undefined,
};

export const useBackupStore = create<BackupState & BackupActions>((set) => ({
  ...initialState,

  setBackups: (backups) => {
    set({
      backups,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  selectBackup: (selectedBackup) => set({ selectedBackup }),

  setBackupInProgress: (backupInProgress) => set({ backupInProgress }),

  addBackup: (backup) => {
    set((state) => {
      const newBackups = [backup, ...state.backups];
      return {
        backups: newBackups,
      };
    });
  },

  removeBackup: (id) => {
    set((state) => {
      // Convert id to number if it's a string
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      const removedBackup = state.backups.find((backup) => backup.id === numId);
      if (!removedBackup) return state;

      const newBackups = state.backups.filter((backup) => backup.id !== numId);
      return {
        backups: newBackups,
        selectedBackup:
          state.selectedBackup?.id === numId ? null : state.selectedBackup,
      };
    });
  },

  updateBackup: (id, data) => {
    set((state) => {
      // Convert id to number if it's a string
      const numId = typeof id === "string" ? parseInt(id, 10) : id;
      const backupIndex = state.backups.findIndex(
        (backup) => backup.id === numId
      );
      if (backupIndex === -1) return state;

      const updatedBackups = [...state.backups];
      const oldBackup = updatedBackups[backupIndex];
      updatedBackups[backupIndex] = { ...oldBackup, ...data };

      return {
        backups: updatedBackups,
        selectedBackup:
          state.selectedBackup?.id === numId
            ? updatedBackups[backupIndex]
            : state.selectedBackup,
      };
    });
  },

  // filters
  setFilters: (filters) => {
    set({
      filters,
    });
  },

  setSearchQuery: (query) => {
    set({
      searchQuery: query,
    });
  },

  setSortConfig: (conf) => {
    set({
      sortConfig: conf,
    });
  },

  setDeletingId: (id) => {
    set({
      deletingId: id,
    });
  },

  setShowCreateForm: (state) => {
    set({
      showCreateForm: state,
    });
  },

  setBackupCreationLogId: (id) => {
    set({
      backupCreationLogId: id,
    });
  },

  setUploadPhase: (phase) => {
    set({ uploadPhase: phase });
  },

  setUploadToastId: (id) => {
    set({
      uploadToastId: id,
    });
  },
}));

export * from "./backup.store";
