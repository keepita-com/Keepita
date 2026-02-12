import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Paperclip,
  MoreVertical,
  CheckCheck,
  Download,
  X,
  FileText,
  Clock,
  Loader2,
  Lock,
  Edit2,
} from "lucide-react";
import {
  useTicketDetails,
  type TicketCommentWithStatus,
} from "../hooks/useTicketDetails";
import { useAuthStore } from "../../auth/store";
import { cn } from "../../../shared/utils/cn";
import EditTicketModal from "../components/EditTicketModal";

const MessageTailIn = () => (
  <svg
    viewBox="0 0 11 20"
    width="11"
    height="20"
    className="absolute -left-[10px] bottom-0 text-[#182533] fill-current"
  >
    <path d="M11 20H0C5.52285 20 10 15.5228 10 10V0L11 20Z" />
  </svg>
);
const MessageTailOut = () => (
  <svg
    viewBox="0 0 11 20"
    width="11"
    height="20"
    className="absolute -right-[10px] bottom-0 text-[#2b5278] fill-current"
  >
    <path d="M0 20H11C5.47715 20 1 15.5228 1 10V0L0 20Z" />
  </svg>
);

const TicketDetailsPage: React.FC = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { ticket, comments, isLoading, sendMessage, updateTicket } =
    useTicketDetails(Number(ticketId));

  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;
    const text = newMessage;
    const file = attachment;
    setNewMessage("");
    setAttachment(null);
    await sendMessage(
      { comment_text: text, attachment: file || undefined },
      currentUser,
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setAttachment(e.target.files[0]);
  };

  const groupMessagesByDate = (msgs: TicketCommentWithStatus[]) => {
    const groups: { [key: string]: TicketCommentWithStatus[] } = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  if (isLoading || !ticket) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e1621]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(comments);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0e1621] text-white overflow-hidden relative">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#17212b]/80 backdrop-blur-md border-b border-black/10 z-30 shrink-0 sticky top-0">
        <button
          onClick={() => navigate("/support")}
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors group"
        >
          <ArrowLeft
            size={22}
            className="text-gray-300 group-hover:text-white"
          />
        </button>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h1 className="font-bold text-[17px] leading-tight truncate">
            {ticket.title}
          </h1>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <span
              className={cn(
                "w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]",
                ticket.status === "open"
                  ? "text-blue-400 bg-blue-400"
                  : ticket.status === "resolved"
                    ? "text-green-400 bg-green-400"
                    : "text-gray-400 bg-gray-400",
              )}
            />
            <span className="capitalize">{ticket.status}</span>
            <span className="opacity-50">•</span>
            <span className="capitalize">{ticket.priority} Priority</span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isMenuOpen
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5",
            )}
          >
            <MoreVertical size={22} />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#17212b] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors text-gray-200"
                >
                  <Edit2 size={16} className="text-blue-400" />
                  Edit Ticket
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex flex-col-reverse overflow-y-auto px-2 sm:px-4 py-2 custom-scrollbar relative">
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 pb-4 mt-auto">
          {Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="relative mb-6">
              <div className="flex justify-center mb-4 sticky top-2 z-20">
                <span className="bg-black/20 backdrop-blur-sm text-white/70 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                  {date}
                </span>
              </div>
              <div className="space-y-1">
                {msgs.map((msg, index) => {
                  const isMe = msg.user.id === Number(currentUser?.id);
                  const isLastInGroup =
                    index === msgs.length - 1 ||
                    msgs[index + 1].user.id !== msg.user.id;
                  return (
                    <MessageBubble
                      key={msg.localId || msg.id}
                      message={msg}
                      isMe={isMe}
                      isLastInGroup={isLastInGroup}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {ticket.status === "closed" ? (
        <div className="p-5 bg-[#17212b] z-30 shrink-0 border-t border-black/10 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-2">
            <Lock size={20} />
          </div>
          <p className="text-gray-400 text-sm font-medium">
            This ticket is closed.
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            Edit the ticket status to Open to send a new message.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-[#17212b] z-30 shrink-0 border-t border-black/10">
          <AnimatePresence>
            {attachment && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 10 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-[#0e1621] rounded-xl overflow-hidden border border-blue-500/30"
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-blue-100">
                      {attachment.name}
                    </div>
                    <div className="text-xs text-blue-300/60">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => setAttachment(null)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 max-w-5xl mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5 active:scale-90"
              title="Attach File"
            >
              <Paperclip size={24} className="-rotate-45" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex-1 bg-[#0e1621] rounded-2xl min-h-[48px] flex items-center shadow-inner border border-white/5 focus-within:border-blue-500/50 transition-colors">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message"
                className="w-full bg-transparent border-none text-[16px] text-white placeholder-gray-500 focus:ring-0 resize-none max-h-32 custom-scrollbar outline-none py-3 px-4 leading-relaxed"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !attachment}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                !newMessage.trim() && !attachment
                  ? "bg-[#2b5278]/20 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-400 hover:shadow-blue-500/20",
              )}
            >
              {newMessage.trim() || attachment ? (
                <Send size={22} className="ml-0.5" />
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-current opacity-20" />
              )}
            </motion.button>
          </div>
        </div>
      )}

      <EditTicketModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ticket={ticket}
        onSubmit={(_, data) => updateTicket(data)}
      />
    </div>
  );
};

interface MessageBubbleProps {
  message: TicketCommentWithStatus;
  isMe: boolean;
  isLastInGroup: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  isLastInGroup,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full group relative pl-2 pr-2",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {!isMe && (
        <div
          className={cn(
            "w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white shadow-md mr-2 shrink-0 transition-opacity",
            isLastInGroup ? "opacity-100 self-end mb-1" : "opacity-0",
          )}
        >
          {message.user.first_name?.[0] || "S"}
        </div>
      )}
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[75%] lg:max-w-[60%] min-w-[120px] shadow-sm transition-all",
          isMe ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "relative px-3 pt-2 pb-5 shadow-sm text-[15.5px] leading-snug break-words",
            isMe
              ? "bg-[#2b5278] text-white rounded-[16px] rounded-tr-[16px]"
              : "bg-[#182533] text-white rounded-[16px] rounded-tl-[16px]",
            isLastInGroup && isMe && "rounded-br-none",
            isLastInGroup && !isMe && "rounded-bl-none",
          )}
        >
          {isLastInGroup && isMe && <MessageTailOut />}
          {isLastInGroup && !isMe && <MessageTailIn />}
          {!isMe && (
            <div className="text-[#64b5f6] text-[13px] font-semibold mb-1 cursor-pointer hover:underline">
              {message.user.first_name} {message.user.last_name}
            </div>
          )}
          {message.attachment && (
            <a
              href={message.attachment}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "flex items-center gap-3 mb-2 p-2 rounded-xl bg-black/20 border border-white/5 hover:bg-black/30 transition-colors group/file overflow-hidden",
                message.isPending && "opacity-70 pointer-events-none",
              )}
            >
              <div className="p-2.5 bg-[#64b5f6]/20 rounded-full text-[#64b5f6] group-hover/file:bg-[#64b5f6] group-hover/file:text-white transition-colors">
                <Download size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white truncate">
                  Attachment
                </div>
                <div className="text-[11px] text-white/50">Tap to download</div>
              </div>
            </a>
          )}
          <div className="whitespace-pre-wrap">{message.comment_text}</div>
          <div
            className={cn(
              "absolute bottom-1 right-2 flex items-center gap-1 select-none pointer-events-none",
              isMe ? "text-[#7fa3cc]" : "text-[#6d7f8f]",
            )}
          >
            <span className="text-[11px]">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isMe && (
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {message.isPending ? (
                    <motion.div
                      key="clock"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Clock
                        size={12}
                        className="animate-[spin_3s_linear_infinite]"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="tick"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <CheckCheck size={14} className="text-[#64b5f6]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketDetailsPage;
