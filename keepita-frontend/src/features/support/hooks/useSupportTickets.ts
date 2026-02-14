import { useState, useEffect, useCallback } from "react";
import {
  getTickets,
  createTicket,
  getTicketStats,
  updateTicket,
} from "../api/support.api";
import type {
  SupportTicket,
  CreateTicketRequest,
  TicketQueryParams,
  TicketStats,
  UpdateTicketRequest,
} from "../types/support.types";
import { toast } from "react-hot-toast";

export const useSupportTickets = (initialParams: TicketQueryParams = {}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (params: TicketQueryParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const ticketResponse = await getTickets(params);
      if (
        ticketResponse &&
        ticketResponse.results &&
        Array.isArray(ticketResponse.results)
      ) {
        setTickets(ticketResponse.results);
      } else {
        setTickets([]);
      }
    } catch (err) {
      setError("Failed to fetch tickets.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const statsResponse = await getTicketStats();
      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (err) {
      console.error("Failed to fetch ticket stats", err);
    }
  }, []);

  const handleCreateTicket = async (data: CreateTicketRequest) => {
    try {
      const newTicket = await createTicket(data);
      setTickets((prev) => [newTicket, ...prev]);
      fetchStats();
      toast.success("Ticket created successfully!");
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ticket.");
      return false;
    }
  };

  const handleUpdateTicket = async (
    ticketId: number,
    data: UpdateTicketRequest,
  ) => {
    try {
      const updatedTicket = await updateTicket(ticketId, data);

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? updatedTicket : t)),
      );

      fetchStats();
      toast.success("Ticket updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ticket");
    }
  };

  useEffect(() => {
    fetchTickets(initialParams);
    fetchStats();
  }, []);

  return {
    tickets,
    stats,
    isLoading,
    error,
    fetchTickets,
    createTicket: handleCreateTicket,
    updateTicket: handleUpdateTicket,
    refreshStats: fetchStats,
  };
};
