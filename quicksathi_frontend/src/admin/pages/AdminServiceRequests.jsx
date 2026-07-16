import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import { Check, X, Eye, ArrowUpRight, Clock, AlertTriangle, Search } from "lucide-react";

const STATUS_STYLES = {
  pending: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Pending Approval" },
  approved: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Approved" },
  rejected: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Rejected" },
};

const AdminServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // default to pending requests
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null); // for viewing full details modal
  const [rejectionId, setRejectionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/service-requests");
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch service requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this service listing?")) return;
    setActioningId(id);
    try {
      await api.patch(`/admin/service-requests/${id}/approve`);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, approvalStatus: "approved", available: true } : r))
      );
      if (selectedRequest?._id === id) {
        setSelectedRequest(prev => ({ ...prev, approvalStatus: "approved", available: true }));
      }
    } catch (err) {
      console.error("Approve service error:", err);
      alert(err.response?.data?.message || "Failed to approve service");
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActioningId(rejectionId);
    try {
      await api.patch(`/admin/service-requests/${rejectionId}/reject`, { reason: rejectionReason });
      setRequests((prev) =>
        prev.map((r) =>
          r._id === rejectionId
            ? { ...r, approvalStatus: "rejected", rejectionReason: rejectionReason, available: false }
            : r
        )
      );
      if (selectedRequest?._id === rejectionId) {
        setSelectedRequest(prev => ({
          ...prev,
          approvalStatus: "rejected",
          rejectionReason,
          available: false,
        }));
      }
      setRejectionId(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Reject service error:", err);
      alert(err.response?.data?.message || "Failed to reject service");
    } finally {
      setActioningId(null);
    }
  };

  // Search & Filter
  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.provider?.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return r.approvalStatus === filter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--admin-border)", borderTopColor: "#3b82f6" }} />
        <span className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>Loading service submissions...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
            Service Listing Approvals
          </h1>
          <p className="text-sm m-0" style={{ color: "var(--admin-text-secondary)" }}>
            Review, approve or reject service listings submitted by registered partners.
          </p>
        </div>

        {/* Counter Widget */}
        <div 
          className="px-5 py-2.5 rounded-2xl border flex flex-col items-center sm:items-start"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <span className="text-[10px] uppercase font-bold" style={{ color: "var(--admin-text-muted)" }}>Pending Items</span>
          <span className="text-lg font-bold mt-0.5" style={{ color: "var(--admin-text-primary)" }}>
            {requests.filter(r => r.approvalStatus === "pending").length}
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by service name, category or partner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs outline-none border transition-all"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--admin-bg-sidebar)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-primary)",
            }}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto max-w-full">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer uppercase transition-all"
              style={{
                backgroundColor: filter === status ? "var(--admin-text-primary)" : "transparent",
                color: filter === status ? "var(--admin-bg-sidebar)" : "var(--admin-text-secondary)",
                borderColor: filter === status ? "var(--admin-text-primary)" : "var(--admin-border)",
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div 
        className="rounded-[32px] border overflow-hidden"
        style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)" }}>
                {["Service", "Partner / Provider", "Category & Price", "Mode", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4.5 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((req) => {
                  const style = STATUS_STYLES[req.approvalStatus] || STATUS_STYLES.pending;
                  return (
                    <tr 
                      key={req._id} 
                      className="hover:bg-neutral-800/5 dark:hover:bg-white/[0.01] transition-all" 
                      style={{ borderBottom: "1px solid var(--admin-border)" }}
                    >
                      {/* Service Column */}
                      <td className="px-6 py-4.5 flex items-center gap-3">
                        {req.thumbnail ? (
                          <img src={req.thumbnail} alt={req.name} className="w-11 h-11 rounded-xl object-cover border" style={{ borderColor: "var(--admin-border)" }} />
                        ) : (
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg border" style={{ backgroundColor: "var(--admin-bg-input)", borderColor: "var(--admin-border)" }}>📷</div>
                        )}
                        <div>
                          <p className="text-xs font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>{req.name}</p>
                          <p className="text-[10px] m-0 mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Slug: {req.slug}</p>
                        </div>
                      </td>

                      {/* Partner Column */}
                      <td className="px-6 py-4.5">
                        <p className="text-xs font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>
                          {req.provider?.businessName || "Individual Partner"}
                        </p>
                        <p className="text-[10px] m-0 mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
                          ID: {req.provider?._id?.slice(-8).toUpperCase()}
                        </p>
                      </td>

                      {/* Category & Price */}
                      <td className="px-6 py-4.5">
                        <p className="text-xs font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>
                          {req.categoryName}
                        </p>
                        <p className="text-[10px] font-semibold m-0 mt-0.5 text-blue-500">
                          Starting at ₹{req.startingPrice?.toLocaleString()} / {req.priceUnit}
                        </p>
                      </td>

                      {/* Service Mode */}
                      <td className="px-6 py-4.5 text-xs font-bold" style={{ color: "var(--admin-text-secondary)" }}>
                        {req.serviceMode || "ON_SITE"}
                      </td>

                      {/* Status Tag */}
                      <td className="px-6 py-4.5">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                            borderColor: style.border,
                          }}
                        >
                          {style.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            title="View Details"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer hover:bg-neutral-800/10 dark:hover:bg-white/5"
                            style={{ color: "var(--admin-text-secondary)", backgroundColor: "var(--admin-bg-input)" }}
                          >
                            <Eye size={14} />
                          </button>

                          {req.approvalStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(req._id)}
                                disabled={actioningId === req._id}
                                title="Approve Service"
                                className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setRejectionId(req._id);
                                  setRejectionReason("");
                                }}
                                disabled={actioningId === req._id}
                                title="Reject Service"
                                className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer bg-rose-500/10 text-rose-500 hover:bg-rose-50 hover:text-white transition-all"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs" style={{ color: "var(--admin-text-muted)" }}>
                    No service requests matching status "{filter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECTION REASON DIALOG MODAL */}
      <AnimatePresence>
        {rejectionId && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl border shadow-xl"
              style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
            >
              <div className="flex items-center gap-3 mb-4 text-rose-500">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold m-0">Reject Service Listing</h3>
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--admin-text-secondary)" }}>
                Please provide a clear explanation for rejecting this service listing. This helps partners correct their listing.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Low quality images, duplicate listing, misleading price..."
                rows={4}
                className="w-full p-4.5 rounded-2xl text-xs outline-none border resize-none mb-5"
                style={{
                  backgroundColor: "var(--admin-bg-input)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectionId(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer hover:bg-neutral-800/10 dark:hover:bg-white/5"
                  style={{ color: "var(--admin-text-secondary)", backgroundColor: "var(--admin-bg-input)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW DETAILS DRAWER MODAL */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-7 rounded-[32px] border shadow-2xl"
              style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4 mb-5" style={{ borderColor: "var(--admin-border)" }}>
                <div>
                  <h3 className="text-lg font-bold m-0">{selectedRequest.name}</h3>
                  <p className="text-xs m-0 mt-1" style={{ color: "var(--admin-text-secondary)" }}>
                    Submitted by: <strong style={{ color: "var(--admin-text-primary)" }}>{selectedRequest.provider?.businessName || "Partner"}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-8 h-8 rounded-full border-0 cursor-pointer flex items-center justify-center hover:bg-neutral-800/10 dark:hover:bg-white/5"
                  style={{ color: "var(--admin-text-primary)", backgroundColor: "var(--admin-bg-input)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-6">
                
                {/* Images */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 h-48 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--admin-border)" }}>
                    <img src={selectedRequest.bannerImage || selectedRequest.thumbnail} alt="banner" className="w-full h-full object-cover" />
                  </div>
                  {selectedRequest.gallery?.slice(0, 3).map((img, i) => (
                    <div key={i} className="h-20 rounded-xl overflow-hidden border" style={{ borderColor: "var(--admin-border)" }}>
                      <img src={img} alt="gallery" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                {/* Info block */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--admin-bg-input)", borderColor: "var(--admin-border)" }}>
                    <span className="text-[10px] uppercase font-bold" style={{ color: "var(--admin-text-muted)" }}>Pricing details</span>
                    <p className="text-base font-bold mt-1 mb-0" style={{ color: "var(--admin-text-primary)" }}>
                      ₹{selectedRequest.startingPrice?.toLocaleString()} / {selectedRequest.priceUnit}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--admin-bg-input)", borderColor: "var(--admin-border)" }}>
                    <span className="text-[10px] uppercase font-bold" style={{ color: "var(--admin-text-muted)" }}>Onboarding status</span>
                    <p className="text-xs font-semibold mt-1 mb-0 uppercase" style={{ color: STATUS_STYLES[selectedRequest.approvalStatus]?.color || "#f59e0b" }}>
                      {selectedRequest.approvalStatus}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--admin-text-muted)" }}>Service Description</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-secondary)" }}>
                    {selectedRequest.fullDescription || selectedRequest.shortDescription || "No detailed description provided."}
                  </p>
                </div>

                {/* Packages */}
                {selectedRequest.packages?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "var(--admin-text-muted)" }}>Available Packages</h4>
                    <div className="flex flex-col gap-2">
                      {selectedRequest.packages.map((pkg, i) => (
                        <div key={i} className="p-4.5 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: "var(--admin-bg-input)", borderColor: "var(--admin-border)" }}>
                          <div>
                            <span className="text-xs font-bold block">{pkg.name}</span>
                            <span className="text-[10px] mt-1 block" style={{ color: "var(--admin-text-muted)" }}>{pkg.features?.join(" • ")}</span>
                          </div>
                          <span className="text-xs font-bold text-blue-500">₹{pkg.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection notice */}
                {selectedRequest.approvalStatus === "rejected" && selectedRequest.rejectionReason && (
                  <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500">
                    <span className="text-[10px] uppercase font-bold">Rejection Reason</span>
                    <p className="text-xs m-0 mt-1">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 border-t pt-5 mt-6" style={{ borderColor: "var(--admin-border)" }}>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer hover:bg-neutral-800/10 dark:hover:bg-white/5"
                  style={{ color: "var(--admin-text-secondary)", backgroundColor: "var(--admin-bg-input)" }}
                >
                  Close
                </button>
                {selectedRequest.approvalStatus === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setRejectionId(selectedRequest._id);
                        setRejectionReason("");
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      Reject Submission
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest._id)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border-0 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Approve Submission
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminServiceRequests;
