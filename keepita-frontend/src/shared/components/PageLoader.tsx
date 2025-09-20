import React, { useEffect } from "react";
import WaveLoader from "./WaveLoader";
import { useLoadingStore } from "../../store/loadingStore";

export const PageLoader: React.FC = () => {
  const { setPageLoading } = useLoadingStore();

  useEffect(() => {
    setPageLoading(true);
    return () => setPageLoading(false);
  }, [setPageLoading]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-xl">
      <div className="w-full h-full flex items-center justify-center p-4">
        <WaveLoader />
      </div>
    </div>
  );
};
