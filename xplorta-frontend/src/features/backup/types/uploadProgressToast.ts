import type { BackupProgress, UploadPhaseUnion } from "../hooks/backup.hooks";

export interface UploadProgressToastContentProps {
  progress: BackupProgress | null;
  uploadPhase?: UploadPhaseUnion;
  toastId: string | undefined;
}
