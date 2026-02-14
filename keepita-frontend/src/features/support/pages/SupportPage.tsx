import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  ChevronRight,
  Search,
  Filter,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ListFilter,
  X,
  Zap,
  Ticket,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupportTickets } from "../hooks/useSupportTickets";
import type {
  TicketStatus,
  TicketPriority,
  SupportTicket,
} from "../types/support.types";

import CreateTicketModal from "../components/CreateTicketModal";
import EditTicketModal from "../components/EditTicketModal";
import CustomSelect from "../../../shared/components/CustomSelect";
import { cn } from "../../../shared/utils/cn";

const STATUS_CHOICES = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_CHOICES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  ...STATUS_CHOICES,
];
const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priority" },
  ...PRIORITY_CHOICES,
];

const SORT_OPTIONS = [
  { value: "-updated_at", label: "Newest First" },
  { value: "updated_at", label: "Oldest First" },
  { value: "-priority", label: "Highest Priority" },
  { value: "status", label: "Status" },
];

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-400 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const priorityIcons: Record<TicketPriority, React.ReactNode> = {
  high: (
    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
  ),
  medium: (
    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
  ),
  low: <div className="w-2 h-2 rounded-full bg-gray-500" />,
};

const SupportPage: React.FC = () => {
  const {
    tickets,
    stats: apiStats,
    isLoading,
    error,
    createTicket,
    updateTicket,
    fetchTickets,
  } = useSupportTickets();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(
    null,
  );

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [ordering, setOrdering] = useState<string>("-updated_at");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets({
        search: searchQuery,
        status: filterStatus === "all" ? undefined : filterStatus,
        priority: filterPriority === "all" ? undefined : filterPriority,
        ordering: ordering,
        page: 1,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus, filterPriority, ordering, fetchTickets]);

  const isFiltering =
    searchQuery !== "" || filterStatus !== "all" || filterPriority !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterPriority("all");
    setOrdering("-updated_at");
  };

  return (
    <div className="min-h-screen text-white space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
          <p className="text-gray-400">Manage your tickets</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Ticket</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tickets",
            value: apiStats?.total_tickets ?? 0,
            icon: <Ticket className="text-violet-400" />,
            color: "from-violet-500/20 to-violet-600/5",
          },
          {
            label: "Open Tickets",
            value: apiStats?.open_tickets ?? 0,
            icon: <LifeBuoy className="text-blue-400" />,
            color: "from-blue-500/20 to-blue-600/5",
          },
          {
            label: "Closed Tickets",
            value: apiStats?.closed_tickets ?? 0,
            icon: <CheckCircle2 className="text-green-400" />,
            color: "from-green-500/20 to-green-600/5",
          },
          {
            label: "High Priority",
            value: apiStats?.high_priority_tickets ?? 0,
            icon: <Zap className="text-red-400" />,
            color: "from-red-500/20 to-red-600/5",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={cn(
              "p-6 rounded-2xl border border-white/5 bg-gradient-to-br",
              stat.color,
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl backdrop-blur-md">
                {stat.icon}
              </div>
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="text-gray-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between bg-gray-900/40 p-3 rounded-2xl border border-white/5">
        <div className="relative flex-1 min-w-[280px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={STATUS_OPTIONS}
            icon={<Filter size={14} />}
            width="w-full sm:w-[160px]"
          />

          <CustomSelect
            value={filterPriority}
            onChange={setFilterPriority}
            options={PRIORITY_OPTIONS}
            icon={<ListFilter size={14} />}
            width="w-full sm:w-[160px]"
          />

          <div className="hidden sm:block w-px h-8 bg-white/10 mx-1" />

          <CustomSelect
            value={ordering}
            onChange={setOrdering}
            options={SORT_OPTIONS}
            icon={<ArrowUpDown size={14} />}
            width="w-full sm:w-[180px]"
          />
        </div>
      </div>

      <motion.div layout className="grid gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-900/30 rounded-2xl animate-pulse border border-white/5"
            />
          ))
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-900/20 border border-white/5 rounded-2xl border-dashed">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-600" />
            </div>

            <p className="text-lg font-medium text-gray-300">
              {isFiltering ? "No matching tickets found" : "No tickets yet"}
            </p>

            {isFiltering ? (
              <div className="flex flex-col items-center gap-3 mt-1">
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline mt-2 transition-colors"
              >
                Create your first ticket
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {tickets.map((ticket) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={ticket.id}
                onClick={() => navigate(`/support/${ticket.id}`)}
                className="group p-5 rounded-2xl bg-gray-900/40 border border-white/5 hover:border-white/10 hover:bg-gray-800/60 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 text-xs font-semibold rounded-full border uppercase tracking-wider",
                          statusStyles[ticket.status],
                        )}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1.5 border-l border-white/10 pl-3">
                        {priorityIcons[ticket.priority]}
                        <span className="capitalize">
                          {ticket.priority} Priority
                        </span>
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200 group-hover:text-blue-400 transition-colors truncate pr-4">
                      {ticket.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-1 mt-1">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 shrink-0">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-xs">
                        {new Date(ticket.updated_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTicket(ticket);
                      }}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/5 z-20"
                      title="Edit Ticket"
                    >
                      <Pencil size={14} />
                    </button>

                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createTicket}
      />

      <EditTicketModal
        isOpen={!!editingTicket}
        ticket={editingTicket}
        onClose={() => setEditingTicket(null)}
        onSubmit={updateTicket}
      />
    </div>
  );
};

export default SupportPage;
