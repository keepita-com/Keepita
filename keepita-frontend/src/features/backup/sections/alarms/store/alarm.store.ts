import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GetAlarmsParams } from "../types/alarm.types";

interface AlarmsStoreState {
  queryParams: Partial<GetAlarmsParams>;
}

interface AlarmsStoreActions {
  updateQueryParams: (params: Partial<GetAlarmsParams>) => void;
  clearFilters: () => void;
  reset: () => void;
}

type AlarmsStore = AlarmsStoreState & AlarmsStoreActions;

const initialState: AlarmsStoreState = {
  queryParams: {
    page: 1,
    pageSize: 50,
    ordering: "time",
  },
};

export const useAlarmsStore = create<AlarmsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      updateQueryParams: (params: Partial<GetAlarmsParams>) => {
        const currentParams = get().queryParams;
        const newParams = { ...currentParams, ...params };

        if (
          params.page === undefined &&
          (params.search !== undefined ||
            params.active !== undefined ||
            params.repeat_type !== undefined ||
            params.time_from !== undefined ||
            params.time_to !== undefined ||
            params.ordering !== undefined)
        ) {
          newParams.page = 1;
        }

        set({ queryParams: newParams });
      },

      clearFilters: () => {
        const currentParams = get().queryParams;
        set({
          queryParams: {
            page: 1,
            pageSize: currentParams.pageSize,
            ordering: currentParams.ordering,

            search: undefined,
            active: undefined,
            repeat_type: undefined,
            time_from: undefined,
            time_to: undefined,
            created_from: undefined,
            created_to: undefined,
          },
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "alarms-store",
    },
  ),
);
