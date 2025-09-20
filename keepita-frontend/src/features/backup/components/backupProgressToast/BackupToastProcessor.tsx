import { useBackupToastRecovery } from "../../hooks/useBackupToastRecovery";
import { useCreateBackupToast } from "../../hooks/useCreateBackupToast";

const BackupToastProcessor = () => {
  useBackupToastRecovery();
  useCreateBackupToast();

  return null;
};

export default BackupToastProcessor;
