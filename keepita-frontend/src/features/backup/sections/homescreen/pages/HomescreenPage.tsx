import React, { useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HomescreenList } from "../components";
import { useHomescreenLayouts } from "../hooks/homescreen.hooks";
import { useHomescreenStore } from "../store/homescreen.store";
import { useDocumentTitle } from "../../../../../shared/hooks/useDocumentTitle";
import {
  SamsungSectionLayout,
  AppleSectionLayout,
} from "../../../../../shared/components";
import { useBackupTheme } from "../../../store/backupThemes.store";
import type { HomescreenItem } from "../types/homescreen.types";

import { useBackupDetails } from "../../../hooks/backup.hooks";
import BackupNotFound from "@/features/backup/components/BackupNotFound";

const HomescreenPage: React.FC = () => {
  const { backupId } = useParams<{ backupId: string }>();
  const navigate = useNavigate();

  const { selectedLayoutId, reset } = useHomescreenStore();
  const { theme } = useBackupTheme();

  const {
    backup,
    isLoading: isBackupLoading,
    error: backupError,
  } = useBackupDetails(backupId);

  useDocumentTitle("Homescreen Layouts | Keepita");

  const homescreenQuery = useHomescreenLayouts(backupId!);
  const { data: homescreenData, isLoading, error } = homescreenQuery;

  const currentLayout =
    homescreenData?.results?.find(
      (layout) => layout.id.toString() === selectedLayoutId,
    ) || homescreenData?.results?.[0];

  useEffect(() => {
    return () => {
      reset();
    };
  }, [backupId, reset]);

  const handleBack = useCallback(() => {
    navigate(`/backups/${backupId}`);
  }, [navigate, backupId]);

  const handleItemClick = useCallback((item: HomescreenItem) => {
    console.log("App clicked:", item);
  }, []);

  const LayoutComponent =
    theme === "Apple" ? AppleSectionLayout : SamsungSectionLayout;

  if (!backupId || backupError || (!isBackupLoading && !backup)) {
    return <BackupNotFound />;
  }

  const subtitle = currentLayout
    ? `Backup ${backupId} • ${currentLayout.rows}×${currentLayout.columns} grid • ${currentLayout.page_count} pages • ${currentLayout.items.length} items`
    : `Backup ${backupId}`;

  return (
    <LayoutComponent
      title="Homescreen Layouts"
      subtitle={subtitle}
      onBack={handleBack}
      isLoading={isLoading}
    >
      <div className="p-4">
        <HomescreenList
          homescreenLayouts={homescreenData?.results || []}
          currentLayout={currentLayout}
          isLoading={isLoading}
          error={error?.message || null}
          onItemClick={handleItemClick}
        />
      </div>
    </LayoutComponent>
  );
};

export default HomescreenPage;
