import { create } from "zustand";

interface LoadingStore {
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isPageLoading: false,
  setPageLoading: (loading: boolean) => set({ isPageLoading: loading }),
}));
