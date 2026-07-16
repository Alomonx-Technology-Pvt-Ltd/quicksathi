import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Mail, Send, CheckCircle2, AlertTriangle, Users, Briefcase, User, Info, Loader2, Globe } from "lucide-react";
import api from "../../config/api";

const AdminNotifications = () => {
  const { theme } = useOutletContext();
  const [recipientType, setRecipientType] = useState("all");
  const [individualEmail, setIndividualEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState(["email", "web"]);
  
  // Loading & feedback states
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (channels.length === 0) {
      setError("Please select at least one delivery channel (Email or In-Website).");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!body.trim()) {
      setError("Message body is required.");
      return;
    }
    if (recipientType === "individual" && !individualEmail.trim()) {
      setError("Recipient email address is required.");
      return;
    }

    setSending(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const payload = {
        recipientType,
        subject,
        body,
        channels,
        email: recipientType === "individual" ? individualEmail : undefined,
      };

      const response = await api.post("/admin/send-email", payload);
      setSuccessInfo(response.data);
      
      // Reset body inputs on success
      setSubject("");
      setBody("");
      setIndividualEmail("");
    } catch (err) {
      console.error("Email send error:", err);
      setError(err.response?.data?.message || "Failed to send email broadcast. Please verify SMTP parameters.");
    } finally {
      setSending(false);
    }
  };

  const recipientOptions = [
    { id: "all", label: "All Users", desc: "Every registered client & provider account", icon: Users },
    { id: "users", label: "Clients Only", desc: "Regular registered customer accounts", icon: User },
    { id: "providers", label: "Providers Only", desc: "Approved service partner profiles", icon: Briefcase },
    { id: "individual", label: "Individual", desc: "Send to a specific custom email address", icon: Mail },
  ];

  const handleChannelToggle = (channel) => {
    setError(null);
    if (channels.includes(channel)) {
      setChannels(channels.filter(c => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto flex flex-col gap-8 pb-12"
    >
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
          Broadcaster Dashboard 📢
        </h1>
        <p className="text-sm m-0" style={{ color: "var(--admin-text-secondary)" }}>
          Send newsletter notifications, platform updates, or custom email announcements directly to users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div 
          className="md:col-span-2 rounded-[32px] border p-8 flex flex-col gap-6"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>Compose Broadcast</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Recipient Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
                Recipients Group
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recipientOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = recipientType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setRecipientType(opt.id);
                        setError(null);
                      }}
                      className="border rounded-2xl p-4 flex gap-3 items-start cursor-pointer select-none transition-all hover:scale-[1.01]"
                      style={{
                        backgroundColor: isSelected ? "var(--admin-bg-input)" : "transparent",
                        borderColor: isSelected ? "#3b82f6" : "var(--admin-border)",
                      }}
                    >
                      <div className="mt-0.5" style={{ color: isSelected ? "#3b82f6" : "var(--admin-text-muted)" }}>
                        <Icon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold" style={{ color: "var(--admin-text-primary)" }}>{opt.label}</span>
                        <span className="text-[10px] leading-normal" style={{ color: "var(--admin-text-muted)" }}>{opt.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Channels */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
                Delivery Channels
              </label>
              <div className="flex gap-4">
                {/* Email Channel */}
                <div 
                  onClick={() => handleChannelToggle("email")}
                  className="flex-1 border rounded-2xl p-4 flex items-center gap-3 cursor-pointer select-none transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: channels.includes("email") ? "var(--admin-bg-input)" : "transparent",
                    borderColor: channels.includes("email") ? "#3b82f6" : "var(--admin-border)",
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={channels.includes("email")} 
                    readOnly
                    className="accent-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold" style={{ color: "var(--admin-text-primary)" }}>Email Broadcast</span>
                    <span className="text-[9px]" style={{ color: "var(--admin-text-muted)" }}>Send via SMTP server</span>
                  </div>
                </div>

                {/* In-Website Alert Channel */}
                <div 
                  onClick={() => handleChannelToggle("web")}
                  className="flex-1 border rounded-2xl p-4 flex items-center gap-3 cursor-pointer select-none transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: channels.includes("web") ? "var(--admin-bg-input)" : "transparent",
                    borderColor: channels.includes("web") ? "#3b82f6" : "var(--admin-border)",
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={channels.includes("web")} 
                    readOnly
                    className="accent-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold" style={{ color: "var(--admin-text-primary)" }}>In-Website Alert</span>
                    <span className="text-[9px]" style={{ color: "var(--admin-text-muted)" }}>Show on client account portal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Email input if selected */}
            <AnimatePresence>
              {recipientType === "individual" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={individualEmail}
                    onChange={(e) => setIndividualEmail(e.target.value)}
                    placeholder="e.g. nityanand666.nk@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-all text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--admin-bg-input)",
                      borderColor: "var(--admin-border)",
                      color: "var(--admin-text-primary)"
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
                Notification Title / Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Important Update Regarding Your Account"
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-all text-xs font-semibold"
                style={{
                  backgroundColor: "var(--admin-bg-input)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-text-primary)"
                }}
              />
            </div>

            {/* Message Body Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
                Message Content
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement details here..."
                rows={7}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-all text-xs font-medium resize-none leading-relaxed"
                style={{
                  backgroundColor: "var(--admin-bg-input)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-text-primary)"
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="flex items-center gap-2.5 p-4 rounded-2xl border text-xs font-bold text-red-500 border-red-500/20"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.05)" }}
              >
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer border-0 shadow-md self-end"
            >
              {sending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info/Status Column */}
        <div className="flex flex-col gap-6">
          {/* Info widget */}
          <div 
            className="rounded-[32px] border p-6 flex flex-col gap-4 text-xs leading-relaxed"
            style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-center gap-2" style={{ color: "#3b82f6" }}>
              <Info size={16} />
              <span className="font-bold uppercase tracking-wider">Broadcaster Guide</span>
            </div>
            <p className="m-0" style={{ color: "var(--admin-text-secondary)" }}>
              To protect recipient privacy, all mass emails are dispatched using BCC lines. Recipient lists are hidden from other accounts.
            </p>
            <p className="m-0" style={{ color: "var(--admin-text-secondary)" }}>
              <strong>SMTP Fallback:</strong> If no SMTP transport settings are defined in your backend `.env` variables, the broadcast will automatically run in <strong>Mock Logs Mode</strong>. This logs the complete content in your console without failing.
            </p>
          </div>

          {/* Success Status widget */}
          <AnimatePresence>
            {successInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-[32px] border p-6 flex flex-col gap-4 border-emerald-500/20"
                style={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
              >
                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 size={18} />
                  <span className="uppercase tracking-wider">Broadcast Sent</span>
                </div>
                <p className="text-xs m-0" style={{ color: "var(--admin-text-secondary)" }}>
                  {successInfo.message}
                </p>
                {successInfo.mock && (
                  <div className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl border bg-amber-500/10 text-amber-500 border-amber-500/25">
                    Mode: Mocked to Backend Console Logs
                  </div>
                )}
                <div className="flex flex-col gap-1 text-[10px] text-neutral-400">
                  <span><strong>Total Accounts:</strong> {successInfo.count}</span>
                  <div className="max-h-[100px] overflow-y-auto mt-1 pr-1 flex flex-col gap-1 border-t pt-2 border-neutral-800/10 dark:border-white/5">
                    {successInfo.recipients?.map((r, i) => (
                      <span key={i} className="truncate">{r}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminNotifications;
