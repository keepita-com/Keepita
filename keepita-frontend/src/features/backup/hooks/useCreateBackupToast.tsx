import { useEffect } from "react";

import toast from "react-hot-toast";

import { useBackupStore } from "../store/backup.store";
import { useBackupToastStore } from "../store/uploadToastStore";

import { useBackupProgress } from "./backup.hooks";

import { UploadProgressToastContent } from "../components/backupProgressToast/UploadProgressToastContent";

export function useCreateBackupToast() {
  const showCreateForm = useBackupStore((s) => s.showCreateForm);

  const backupCreationId = useBackupToastStore(
    (state) => state.backupCreationId
  );
  const setBackupCreationId = useBackupToastStore(
    (state) => state.setBackupCreationId
  );
  const { progress } = useBackupProgress(backupCreationId ?? undefined);
  const uploadPhase = useBackupStore((state) => state.uploadPhase);

  const uploadToastId = useBackupStore((state) => state.uploadToastId);
  const setUploadToastId = useBackupStore((state) => state.setUploadToastId);

  useEffect(() => {
    if (!showCreateForm) return;

    if (uploadPhase !== "idle" && uploadPhase !== "uploading") {
      if (!uploadToastId) {
        setUploadToastId(
          toast(
            () => (
              <UploadProgressToastContent
                progress={progress}
                uploadPhase={uploadPhase}
                toastId={uploadToastId}
              />
            ),
            { duration: Infinity }
          )
        );
      } else {
        toast(
          <UploadProgressToastContent
            progress={progress}
            uploadPhase={uploadPhase}
            toastId={uploadToastId}
          />,
          {
            id: uploadToastId,
          }
        );
      }
    }

    if (progress?.status === "completed") {
      setBackupCreationId(null);

      setTimeout(() => {
        toast.dismiss(uploadToastId);
      }, 5000);
    }
  }, [progress, uploadPhase]);
}
