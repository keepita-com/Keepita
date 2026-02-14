import { useState, useEffect, useCallback } from "react";
import {
  getTicketById,
  getTicketComments,
  createTicketComment,
  updateTicket,
} from "../api/support.api";
import type {
  SupportTicket,
  TicketComment,
  CreateCommentRequest,
  UpdateTicketRequest,
} from "../types/support.types";
import { toast } from "react-hot-toast";

export type TicketCommentWithStatus = TicketComment & {
  isPending?: boolean;
  localId?: number;
};

export const useTicketDetails = (ticketId: number) => {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [comments, setComments] = useState<TicketCommentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [ticketData, commentsData] = await Promise.all([
        getTicketById(ticketId),
        getTicketComments(ticketId),
      ]);
      setTicket(ticketData);
      setComments((prev) => {
        const pending = prev.filter((c) => c.isPending);
        return [...commentsData, ...pending];
      });
    } catch (error) {
      console.error("Failed to fetch ticket details", error);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sendMessage = async (
    data: CreateCommentRequest,
    currentUser: any,
  ): Promise<boolean> => {
    if (ticket?.status === "closed") {
      toast.error("Ticket is closed");
      return false;
    }

    const tempId = Date.now();
    const pendingMessage: TicketCommentWithStatus = {
      id: tempId,
      localId: tempId,
      ticket: ticketId,
      user: currentUser,
      comment_text: data.comment_text,
      attachment: data.attachment ? URL.createObjectURL(data.attachment) : null,
      created_at: new Date().toISOString(),
      isPending: true,
    };

    setComments((prev) => [...prev, pendingMessage]);

    try {
      const [newComment] = await Promise.all([
        createTicketComment(ticketId, data),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
      setComments((prev) =>
        prev.map((c) => (c.localId === tempId ? newComment : c)),
      );
      return true;
    } catch (error) {
      console.error("Failed to send message", error);
      setComments((prev) => prev.filter((c) => c.localId !== tempId));
      return false;
    }
  };

  const handleUpdateTicket = async (data: UpdateTicketRequest) => {
    try {
      const updated = await updateTicket(ticketId, data);
      setTicket(updated);
      toast.success("Ticket updated");
    } catch (error) {
      console.error("Failed to update ticket", error);
      toast.error("Failed to update");
    }
  };

  return {
    ticket,
    comments,
    isLoading,
    sendMessage,
    updateTicket: handleUpdateTicket,
  };
};
