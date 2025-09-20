import type { ApiResponseList } from "../../../core/types/apiResponse";

export type Notification = {
  id: number;
  title: string;
  message: string;
  is_seen: boolean;
  created_at: string;
};

export type useNotificationsResponse = ApiResponseList<Notification[]>;

export type useMarkAsReadResponse = {
  id: number;
  title: string;
  message: string;
  is_seen: boolean;
  created_at: string;
};

export type useMarkAsReadReqPayload = {
  id: number;
};
