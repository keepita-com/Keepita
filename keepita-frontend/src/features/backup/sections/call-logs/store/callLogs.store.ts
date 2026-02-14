import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GetCallLogsParams } from "../types/callLogs.types";

interface CallLogsStore {
  queryParams: GetCallLogsParams;

  setQueryParams: (params: Partial<GetCallLogsParams>) => void;
  updateQueryParams: (params: Partial<GetCallLogsParams>) => void;
  clearFilters: () => void;
  reset: () => void;
}

const initialState = {
  queryParams: {
    page: 1,
    page_size: 25,
    ordering: "-date",
  } as GetCallLogsParams,
};

export const useCallLogsStore = create<CallLogsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setQueryParams: (params) =>
        set(
          (state) => ({
            queryParams: { ...state.queryParams, ...params, page: 1 },
          }),
          false,
          "setQueryParams",
        ),

      updateQueryParams: (params) =>
        set(
          (state) => ({
            queryParams: { ...state.queryParams, ...params, page: 1 },
          }),
          false,
          "updateQueryParams",
        ),

      clearFilters: () =>
        set(
          {
            queryParams: {
              page: 1,
              page_size: 25,
              ordering: "-date",
              search: undefined,
              call_type: undefined,
              has_contact: undefined,
              missed_calls: undefined,
              date_from: undefined,
              date_to: undefined,
              duration_min: undefined,
              duration_max: undefined,
            },
          },
          false,
          "clearFilters",
        ),

      reset: () => set(initialState, false, "reset"),
    }),
    {
      name: "call-logs-store",
    },
  ),
);
