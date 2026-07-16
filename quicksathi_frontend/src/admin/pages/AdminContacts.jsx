import { useState, useEffect } from "react";
import api from "../../config/api";
import {
  Mail,
  Trash2,
  CheckCircle,
  Archive,
  Search,
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  X
} from "lucide-react";

export default function AdminContacts() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/contact/admin-list");
      setMessages(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve contact form submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await api.patch(`/contact/admin-list/${id}`, { status: newStatus });
      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? response.data : msg))
      );
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(response.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message permanently?")) return;
    try {
      await api.delete(`/contact/admin-list/${id}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const statusMatches = statusFilter === "all" || msg.status === statusFilter;
    const name = `${msg.firstName || ""} ${msg.lastName || ""}`.toLowerCase();
    const email = (msg.email || "").toLowerCase();
    const messageContent = (msg.message || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const searchMatches =
      name.includes(query) ||
      email.includes(query) ||
      messageContent.includes(query);

    return statusMatches && searchMatches;
  });

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6 w-full smooth-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal m-0" style={{ fontFamily: "var(--font-display)" }}>
            User Form Submissions
          </h1>
          <p className="text-xs m-0 mt-1.5" style={{ color: "var(--admin-text-secondary)" }}>
            Review and respond to messages submitted by users via the website contact form.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5 text-red-500 text-xs">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="rounded-2xl p-4 border flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex items-center gap-2 bg-neutral-900/10 dark:bg-white/5 border rounded-xl px-3 py-2 w-full sm:max-w-xs" style={{ borderColor: "var(--admin-border)" }}>
          <Search size={15} style={{ color: "var(--admin-text-muted)" }} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 text-xs outline-none w-full"
            style={{ color: "var(--admin-text-primary)" }}
          />
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-900/10 dark:bg-white/5 p-1 rounded-xl border" style={{ borderColor: "var(--admin-border)" }}>
          {["all", "unread", "read", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-3 py-1.5 rounded-lg border-0 text-[10px] font-semibold cursor-pointer uppercase transition-all"
              style={{
                backgroundColor: statusFilter === status ? "var(--admin-bg-hover)" : "transparent",
                color: "var(--admin-text-primary)",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Grid/Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "var(--admin-border)", borderTopColor: "var(--color-primary)" }} />
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Sender Name</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Email</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Message Snippet</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Submitted At</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => {
                  const senderName = `${msg.firstName || ""} ${msg.lastName || ""}`.trim();
                  return (
                    <tr
                      key={msg._id}
                      className="border-b hover:bg-neutral-900/5 dark:hover:bg-white/[0.02] cursor-pointer transition-all"
                      style={{ borderColor: "var(--admin-border)" }}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (msg.status === "unread") {
                          handleUpdateStatus(msg._id, "read");
                        }
                      }}
                    >
                      <td className="p-4">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor:
                              msg.status === "unread"
                                ? "rgba(245,158,11,0.12)"
                                : msg.status === "read"
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(255,255,255,0.08)",
                            color:
                              msg.status === "unread"
                                ? "#f59e0b"
                                : msg.status === "read"
                                ? "#22c55e"
                                : "var(--admin-text-muted)",
                            border: `1px solid ${
                              msg.status === "unread"
                                ? "rgba(245,158,11,0.2)"
                                : msg.status === "read"
                                ? "rgba(34,197,94,0.2)"
                                : "rgba(255,255,255,0.1)"
                            }`,
                          }}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-white/90" style={{ color: "var(--admin-text-primary)" }}>{senderName}</td>
                      <td className="p-4" style={{ color: "var(--admin-text-secondary)" }}>{msg.email}</td>
                      <td className="p-4 truncate max-w-[200px]" style={{ color: "var(--admin-text-muted)" }}>{msg.message}</td>
                      <td className="p-4" style={{ color: "var(--admin-text-secondary)" }}>
                        {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {msg.status !== "archived" && (
                            <button
                              onClick={() => handleUpdateStatus(msg._id, "archived")}
                              title="Archive message"
                              className="p-1.5 rounded-lg border-0 bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50 cursor-pointer"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                          {msg.status === "archived" && (
                            <button
                              onClick={() => handleUpdateStatus(msg._id, "read")}
                              title="Restore message"
                              className="p-1.5 rounded-lg border-0 bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            title="Delete message"
                            className="p-1.5 rounded-lg border-0 bg-transparent text-neutral-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredMessages.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-xs" style={{ color: "var(--admin-text-muted)" }}>
                      No contact messages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message Viewer Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />
          
          <div
            className="relative w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-5 shadow-2xl smooth-fade-in"
            style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex items-center gap-2.5">
                <MessageSquare size={18} className="text-[#3b82f6]" />
                <span className="font-semibold text-sm">Message Viewer</span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg border-0 bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sender details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <span style={{ color: "var(--admin-text-muted)" }} className="font-semibold uppercase tracking-wide text-[9px]">Sender</span>
                <span className="flex items-center gap-1.5 text-white/90" style={{ color: "var(--admin-text-primary)" }}>
                  <User size={13} /> {selectedMessage.firstName} {selectedMessage.lastName}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ color: "var(--admin-text-muted)" }} className="font-semibold uppercase tracking-wide text-[9px]">Email Address</span>
                <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-1.5 font-bold hover:underline" style={{ color: "#3b82f6" }}>
                  <Mail size={13} /> {selectedMessage.email}
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ color: "var(--admin-text-muted)" }} className="font-semibold uppercase tracking-wide text-[9px]">Date Submitted</span>
                <span className="flex items-center gap-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                  <Clock size={13} />
                  {new Date(selectedMessage.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ color: "var(--admin-text-muted)" }} className="font-semibold uppercase tracking-wide text-[9px]">Archive State</span>
                <span className="capitalize" style={{ color: "var(--admin-text-secondary)" }}>{selectedMessage.status}</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex flex-col gap-1.5 text-xs">
              <span style={{ color: "var(--admin-text-muted)" }} className="font-semibold uppercase tracking-wide text-[9px]">Message Body</span>
              <div
                className="p-4 rounded-xl leading-relaxed text-xs overflow-y-auto max-h-[180px] border whitespace-pre-wrap"
                style={{ backgroundColor: "var(--admin-bg-input)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
              >
                {selectedMessage.message}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex gap-2">
                {selectedMessage.status !== "archived" ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage._id, "archived")}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold border-0 bg-neutral-800 text-white cursor-pointer hover:bg-neutral-700 transition-all flex items-center gap-1.5"
                  >
                    <Archive size={13} /> Archive
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage._id, "read")}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold border-0 bg-neutral-800 text-white cursor-pointer hover:bg-neutral-700 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle size={13} /> Unarchive
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(selectedMessage._id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold border-0 bg-red-600/10 hover:bg-red-600/20 text-red-500 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=Reply from QuickSathi&body=Hello ${selectedMessage.firstName},%0D%0A%0D%0ARegarding your message:%0D%0A"${selectedMessage.message}"%0D%0A%0D%0A`}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border-0 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer transition-all flex items-center gap-1.5 no-underline"
              >
                Reply <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
