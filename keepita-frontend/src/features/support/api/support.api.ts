import { DataProvider } from "../../../core/api/dataProvider";
import type {
  SupportTicket,
  TicketComment,
  CreateTicketRequest,
  CreateCommentRequest,
  UpdateTicketRequest,
  TicketQueryParams,
  PaginatedTicketResult,
  TicketStats,
} from "../types/support.types";

const SUPPORT_BASE_URL = "support/ticket/";

export const getTickets = async (params: TicketQueryParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.status && params.status !== "all")
    queryParams.append("status", params.status);
  if (params.priority && params.priority !== "all")
    queryParams.append("priority", params.priority);
  if (params.search) queryParams.append("search", params.search);
  if (params.ordering) queryParams.append("ordering", params.ordering);

  const response = await DataProvider.get<PaginatedTicketResult>(
    `${SUPPORT_BASE_URL}?${queryParams.toString()}`,
  );
  return response.data;
};

export const getTicketStats = async () => {
  const response = await DataProvider.get<TicketStats>(
    `${SUPPORT_BASE_URL}stats/`,
  );
  return response.data;
};

export const getTicketById = async (ticketId: number) => {
  const response = await DataProvider.get<SupportTicket>(
    `${SUPPORT_BASE_URL}${ticketId}/`,
  );
  return response.data;
};

export const createTicket = async (data: CreateTicketRequest) => {
  const response = await DataProvider.post<SupportTicket, CreateTicketRequest>(
    SUPPORT_BASE_URL,
    data,
  );
  return response.data;
};

export const updateTicket = async (
  ticketId: number,
  data: UpdateTicketRequest,
) => {
  const response = await DataProvider.patch<SupportTicket, UpdateTicketRequest>(
    `${SUPPORT_BASE_URL}${ticketId}/`,
    data,
  );
  return response.data;
};

export const deleteTicket = async (ticketId: number) => {
  const response = await DataProvider.delete<void>(
    `${SUPPORT_BASE_URL}${ticketId}/`,
  );
  return response;
};

export const getTicketComments = async (ticketId: number) => {
  const response = await DataProvider.get<TicketComment[]>(
    `${SUPPORT_BASE_URL}${ticketId}/comments/`,
  );
  return response.data;
};

export const createTicketComment = async (
  ticketId: number,
  data: CreateCommentRequest,
) => {
  const formData = new FormData();
  formData.append("comment_text", data.comment_text);
  if (data.reaction) {
    formData.append("reaction", data.reaction);
  }
  if (data.attachment) {
    formData.append("attachment", data.attachment);
  }

  const response = await DataProvider.post<TicketComment, FormData>(
    `${SUPPORT_BASE_URL}${ticketId}/comments/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const updateTicketComment = async (
  commentId: number,
  data: Partial<CreateCommentRequest>,
) => {
  const formData = new FormData();
  if (data.comment_text) {
    formData.append("comment_text", data.comment_text);
  }
  if (data.reaction) {
    formData.append("reaction", data.reaction);
  }
  if (data.attachment) {
    formData.append("attachment", data.attachment);
  }

  const response = await DataProvider.patch<TicketComment, FormData>(
    `${SUPPORT_BASE_URL}comment/${commentId}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const deleteTicketComment = async (commentId: number) => {
  const response = await DataProvider.delete<void>(
    `${SUPPORT_BASE_URL}comment/${commentId}/`,
  );
  return response;
};
