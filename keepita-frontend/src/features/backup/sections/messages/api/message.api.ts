import { DataProvider } from "../../../../../core/api/dataProvider";
import {
  buildThreadsQueryParams,
  buildThreadMessagesQueryParams,
} from "../utils/message.utils";
import type {
  MessageThread,
  Message,
  MessageThreadsResponse,
  ChatListFilters,
  ChatMessageFilters,
} from "../types/message.types";

const RESOURCE = "dashboard";

const MESSAGE_API_ENDPOINTS = {
  THREADS_LIST: (backupId: number) =>
    `${RESOURCE}/backups/${backupId}/messages/threads/`,
  THREAD_DETAIL: (backupId: number, threadId: number) =>
    `${RESOURCE}/backups/${backupId}/messages/threads/${threadId}/`,
} as const;

export { MESSAGE_API_ENDPOINTS };

export const getMessageThreads = async (
  backupId: number,
  page: number = 1,
  filters: ChatListFilters = {},
): Promise<MessageThreadsResponse> => {
  const params = buildThreadsQueryParams(page, filters);

  const response = await DataProvider.get<MessageThreadsResponse>(
    `${MESSAGE_API_ENDPOINTS.THREADS_LIST(backupId)}?${params}`,
  );
  return response.data;
};

export const searchMessageThreads = async (
  backupId: number,
  query: string,
  page: number = 1,
): Promise<MessageThreadsResponse> => {
  return getMessageThreads(backupId, page, { search: query });
};

export const getMessageThread = async (
  backupId: number,
  threadId: number,
  filters: ChatMessageFilters = {},
): Promise<{ thread: MessageThread; messages: Message[] }> => {
  const params = buildThreadMessagesQueryParams(filters);

  const queryString = params.toString();
  const url = queryString
    ? `${MESSAGE_API_ENDPOINTS.THREAD_DETAIL(
        backupId,
        threadId,
      )}?${queryString}`
    : MESSAGE_API_ENDPOINTS.THREAD_DETAIL(backupId, threadId);

  const response = await DataProvider.get<{
    thread: MessageThread;
    messages: Message[];
  }>(url);

  return response.data;
};
