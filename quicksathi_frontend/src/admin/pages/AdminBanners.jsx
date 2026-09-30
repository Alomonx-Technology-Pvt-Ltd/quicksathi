import { useState, useEffect } from "react";
import api from "../../config/api";
import {
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Power,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Search,
  Upload,
} from "lucide-react";

const emptyBanner = {
  title: "",
  subtitle: "",
  badge: "Featured Offer",
  badgeBg: "rgba(255, 255, 255, 0.22)",
  badgeColor: "#ffffff",
  image: "",
  imageAlt: "",
  link: "/services",
  cta: "BOOK",
  textColor: "#ffffff",
  subtitleColor: "rgba(255, 255, 255, 0.9)",
  buttonBg: "#0284c7",
  buttonText: "#ffffff",
  bgFallback: "#0d2b45",
  overlayGradient:
    "linear-gradient(90deg, rgba(8, 28, 48, 0.85) 0%, rgba(12, 38, 64, 0.70) 52%, rgba(12, 38, 64, 0.25) 82%, rgba(12, 38, 64, 0.05) 100%)",
  order: 0,
  isActive: true,
};

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyBanner });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const cardStyle = {
    backgroundColor: "var(--admin-card-bg)",
    border: "1px solid var(--admin-border)",
  };

  const inputStyle = {
    backgroundColor: "var(--admin-input-bg)",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-text-primary)",
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/banners/admin");
      setBanners(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showMessage = (msg, type = "success") => {
    if (type === "success") {
      setSuccess(msg);
      setError("");
    } else {
      setError(msg);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const { data } = await api.post("/admin/upload", { image: reader.result });
        setForm((prev) => ({ ...prev, image: data.url }));
        showMessage("Banner image uploaded successfully!");
      } catch (err) {
        console.error("Image upload failed:", err);
        showMessage("Failed to upload image. Please try pasting a direct image URL.", "error");
      } finally {
        setUploading(false);
      }
    };
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyBanner,
      order: banners.length,
    });
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      badge: banner.badge || "",
      badgeBg: banner.badgeBg || "rgba(255, 255, 255, 0.22)",
      badgeColor: banner.badgeColor || "#ffffff",
      image: banner.image || "",
      imageAlt: banner.imageAlt || "",
      link: banner.link || "/services",
      cta: banner.cta || "BOOK",
      textColor: banner.textColor || "#ffffff",
      subtitleColor: banner.subtitleColor || "rgba(255, 255, 255, 0.9)",
      buttonBg: banner.buttonBg || "#0284c7",
      buttonText: banner.buttonText || "#ffffff",
      bgFallback: banner.bgFallback || "#0d2b45",
      overlayGradient: banner.overlayGradient || "",
      order: banner.order !== undefined ? banner.order : 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showMessage("Banner title is required", "error");
      return;
    }
    if (!form.image.trim()) {
      showMessage("Banner image URL is required", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, form);
        showMessage("Banner updated successfully!");
      } else {
        await api.post("/banners", form);
        showMessage("Banner created successfully!");
      }
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to save banner", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner) => {
    try {
      await api.patch(`/banners/${banner._id}/toggle`);
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
      );
      showMessage(`Banner ${!banner.isActive ? "activated" : "deactivated"}!`);
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to toggle banner", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/banners/${id}`);
      showMessage("Banner deleted successfully!");
      setDeleteConfirm(null);
      fetchBanners();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to delete banner", "error");
    }
  };

  const filteredBanners = banners.filter((b) => {
    const matchSearch =
      (b.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.subtitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.badge || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.link || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "active") return matchSearch && b.isActive;
    if (statusFilter === "inactive") return matchSearch && !b.isActive;
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight m-0"
            style={{ color: "var(--admin-text-primary)" }}
          >
            Banner Management
          </h1>
          <p className="text-sm mt-1 mb-0" style={{ color: "var(--admin-text-secondary)" }}>
            Create and customize dynamic promo banners displayed across the platform homepage.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm cursor-pointer border-0 transition-transform active:scale-95"
          style={{ backgroundColor: "var(--admin-primary, #0b4fd8)" }}
        >
          <Plus size={18} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* ── Alerts ── */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4" style={cardStyle}>
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--admin-text-secondary)" }}
          />
          <input
            type="text"
            placeholder="Search by title, badge, or link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "active", "inactive"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border transition-all"
              style={{
                backgroundColor: statusFilter === st ? "var(--admin-primary)" : "transparent",
                color: statusFilter === st ? "#ffffff" : "var(--admin-text-muted)",
                borderColor: statusFilter === st ? "var(--admin-primary)" : "var(--admin-border)",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Banners Grid ── */}
      {loading ? (
        <div className="p-12 text-center" style={{ color: "var(--admin-text-secondary)" }}>
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading banners...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={cardStyle}>
          <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold m-0" style={{ color: "var(--admin-text-primary)" }}>
            No Banners Found
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--admin-text-secondary)" }}>
            {searchQuery ? "Try changing your search keywords." : "Get started by adding your first platform banner."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner._id}
              className="rounded-2xl overflow-hidden border flex flex-col justify-between transition-all duration-200"
              style={cardStyle}
            >
              {/* Banner Live Visual Preview */}
              <div
                className="relative h-48 sm:h-52 w-full p-6 flex flex-col justify-between overflow-hidden"
                style={{
                  backgroundColor: banner.bgFallback || "#0d2b45",
                  backgroundImage: `url(${banner.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center right",
                }}
              >
                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      banner.overlayGradient ||
                      "linear-gradient(90deg, rgba(8, 28, 48, 0.90) 0%, rgba(12, 38, 64, 0.75) 60%, rgba(12, 38, 64, 0.15) 100%)",
                  }}
                />

                {/* Top Badge & Order */}
                <div className="relative z-10 flex items-center justify-between">
                  {banner.badge ? (
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                      style={{
                        backgroundColor: banner.badgeBg || "rgba(255,255,255,0.2)",
                        color: banner.badgeColor || "#ffffff",
                      }}
                    >
                      {banner.badge}
                    </span>
                  ) : <span />}

                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-black/50 text-white/90">
                    Order #{banner.order}
                  </span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-sm">
                  <h3
                    className="text-lg sm:text-xl font-bold tracking-tight m-0 leading-snug"
                    style={{ color: banner.textColor || "#ffffff" }}
                  >
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p
                      className="text-xs sm:text-sm mt-1 mb-3 line-clamp-2"
                      style={{ color: banner.subtitleColor || "rgba(255,255,255,0.85)" }}
                    >
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-sm"
                    style={{
                      backgroundColor: banner.buttonBg || "#0284c7",
                      color: banner.buttonText || "#ffffff",
                    }}
                  >
                    <span>{banner.cta || "BOOK"}</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              {/* Banner Details & Action Footer */}
              <div className="p-4 border-t flex flex-wrap items-center justify-between gap-3"
                style={{ borderColor: "var(--admin-border)" }}
              >
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
                  <ExternalLink size={13} />
                  <span className="font-mono max-w-[200px] truncate" style={{ color: "var(--admin-detail-text)" }}>{banner.link}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Active Toggle Button */}
                  <button
                    onClick={() => handleToggle(banner)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                      banner.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    <Power size={13} />
                    <span>{banner.isActive ? "Active" : "Inactive"}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-1.5 rounded-lg cursor-pointer transition-colors"
                    style={{ border: "1px solid var(--admin-border)", backgroundColor: "var(--admin-btn-ghost-bg)", color: "var(--admin-text-secondary)" }}
                    title="Edit Banner"
                  >
                    <Pencil size={15} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirm(banner._id)}
                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Banner Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div
            className="w-full max-w-2xl rounded-2xl p-6 sm:p-8 my-8 border shadow-2xl relative"
            style={cardStyle}
          >
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--admin-text-primary)" }}>
              {editingId ? "Edit Banner" : "Create New Banner"}
            </h2>
            <p className="text-xs mb-6" style={{ color: "var(--admin-text-secondary)" }}>
              Configure banner headlines, image, link, and styling.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Deep clean with foam-jet AC service"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. Top Pick"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. AC service, gas refill & doorstep repair"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                  Banner Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://... or /images/ac/foam-jet.webp"
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none font-mono"
                    style={inputStyle}
                  />
                  <label className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer flex items-center gap-1.5 hover:bg-white/5 transition-colors"
                    style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}>
                    <Upload size={14} />
                    <span>{uploading ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Link & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Target Link / Route
                  </label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="/services/ac or /category/wedding"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none font-mono"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    value={form.cta}
                    onChange={(e) => setForm({ ...form, cta: e.target.value })}
                    placeholder="BOOK"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Button Color & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Button Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.buttonBg}
                      onChange={(e) => setForm({ ...form, buttonBg: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={form.buttonBg}
                      onChange={(e) => setForm({ ...form, buttonBg: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                />
                <label htmlFor="banner-active" className="text-sm font-medium cursor-pointer" style={{ color: "var(--admin-text-primary)" }}>
                  Visible on Platform Homepage
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-colors"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-secondary)", backgroundColor: "var(--admin-btn-ghost-bg)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: "var(--admin-primary)" }}
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 border shadow-2xl" style={cardStyle}>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--admin-text-primary)" }}>
              Delete Banner?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--admin-text-secondary)" }}>
              Are you sure you want to delete this banner? It will immediately disappear from the homepage carousel.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-secondary)", backgroundColor: "var(--admin-btn-ghost-bg)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 border-0 cursor-pointer shadow-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
