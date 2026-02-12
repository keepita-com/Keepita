import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  theme: "Apple" | "Samsung" | "Xiaomi" | string;
};

type Action = {
  setBackupTheme: (theme: "Apple" | "Samsung" | "Xiaomi" | string) => void;
};

type BackupProcessIdStore = State & Action;

export const useBackupTheme = create<BackupProcessIdStore>()(
  persist(
    (set) => ({
      theme: "Samsung",
      setBackupTheme: (theme) => {
        set({ theme });
      },
    }),
    { name: "backupTheme" }
  )
);
