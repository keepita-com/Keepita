import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Modal from "../../../shared/components/Modal";
import { cn } from "../../../shared/utils/cn";
import type {
  SupportTicket,
  UpdateTicketRequest,
  TicketStatus,
  TicketPriority,
} from "../types/support.types";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  onSubmit: (ticketId: number, data: UpdateTicketRequest) => Promise<void>;
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<UpdateTicketRequest>();

  useEffect(() => {
    if (isOpen && ticket) {
      setValue("status", ticket.status);
      setValue("priority", ticket.priority);
    }
  }, [isOpen, ticket, setValue]);

  const handleFormSubmit = async (data: UpdateTicketRequest) => {
    if (ticket) {
      await onSubmit(ticket.id, data);
      onClose();
    }
  };

  if (!ticket) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Ticket">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-500 ml-1">
            Ticket Subject
          </label>
          <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-gray-300 text-sm">
            {ticket.title}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 ml-1">
            Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {STATUS_OPTIONS.map((option) => (
              <label key={option.value} className="cursor-pointer relative">
                <input
                  type="radio"
                  value={option.value}
                  {...register("status")}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "p-3 rounded-xl border bg-gray-900/50 text-center text-sm font-medium transition-all",
                    "border-white/10 text-gray-400 hover:bg-white/5",
                    "peer-checked:border-blue-500/50 peer-checked:bg-blue-500/10 peer-checked:text-blue-400",
                  )}
                >
                  {option.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 ml-1">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PRIORITY_OPTIONS.map((option) => (
              <label key={option.value} className="cursor-pointer relative">
                <input
                  type="radio"
                  value={option.value}
                  {...register("priority")}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "p-3 rounded-xl border bg-gray-900/50 text-center text-sm font-medium transition-all",
                    "border-white/10 text-gray-400 hover:bg-white/5",
                    "peer-checked:border-blue-500/50 peer-checked:bg-blue-500/10 peer-checked:text-blue-400",
                  )}
                >
                  {option.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-white shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm",
              isSubmitting && "cursor-wait",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTicketModal;
