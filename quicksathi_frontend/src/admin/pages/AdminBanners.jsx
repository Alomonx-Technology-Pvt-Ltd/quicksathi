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
  LayoutGrid,
  Monitor,
  FileText,
} from "lucide-react";

const SECTION_OPTIONS = [
  { value: "carousel", label: "Carousel Banners", icon: LayoutGrid, desc: "Homepage Featured Services slider" },
  { value: "spotlight", label: "Spotlight Promo", icon: Monitor, desc: "Homepage large promo section (Wedding / Tuition)" },
  { value: "category_page", label: "Category Page", icon: FileText, desc: "Banner shown on individual category detail pages" },
];

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
  section: "carousel",
  category: "",
  // Spotlight fields
  tag: "",
  tagBg: "rgba(14, 165, 233, 0.12)",
  tagColor: "#0284c7",
  headline: "",
  subheadLabel: "",
  subheadItems: "",
  bullets: [],
  ctaText: "",
  ctaLink: "",
  themeColor: "",
  buttonShadow: "",
  // Category page fields
  badgeStyle: "",
  matchKeywords: [],
  borderColor: "",
  overlayLeft: "rgba(255, 255, 255, 0.97)",
  overlayMid: "rgba(248, 250, 252, 0.90)",
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
  const [activeSection, setActiveSection] = useState("carousel");

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
      section: activeSection,
      order: banners.filter((b) => (b.section || "carousel") === activeSection).length,
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
      section: banner.section || "carousel",
      category: banner.category || "",
      // Spotlight
      tag: banner.tag || "",
      tagBg: banner.tagBg || "rgba(14, 165, 233, 0.12)",
      tagColor: banner.tagColor || "#0284c7",
      headline: banner.headline || "",
      subheadLabel: banner.subheadLabel || "",
      subheadItems: banner.subheadItems || "",
      bullets: Array.isArray(banner.bullets) ? banner.bullets : [],
      ctaText: banner.ctaText || "",
      ctaLink: banner.ctaLink || "",
      themeColor: banner.themeColor || "",
      buttonShadow: banner.buttonShadow || "",
      // Category page
      badgeStyle: banner.badgeStyle || "",
      matchKeywords: Array.isArray(banner.matchKeywords) ? banner.matchKeywords : [],
      borderColor: banner.borderColor || "",
      overlayLeft: banner.overlayLeft || "rgba(255, 255, 255, 0.97)",
      overlayMid: banner.overlayMid || "rgba(248, 250, 252, 0.90)",
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

  // Filter by section tab, search query, and status
  const filteredBanners = banners.filter((b) => {
    const bannerSection = b.section || "carousel";
    if (bannerSection !== activeSection) return false;

    const matchSearch =
      (b.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.subtitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.badge || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.link || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "active") return matchSearch && b.isActive;
    if (statusFilter === "inactive") return matchSearch && !b.isActive;
    return matchSearch;
  });

  const sectionCounts = {
    carousel: banners.filter((b) => (b.section || "carousel") === "carousel").length,
    spotlight: banners.filter((b) => b.section === "spotlight").length,
    category_page: banners.filter((b) => b.section === "category_page").length,
  };

  // Helper for bullets field (comma-separated string input)
  const handleBulletsChange = (val) => {
    const arr = val.split("\n").filter((s) => s.trim());
    setForm((prev) => ({ ...prev, bullets: arr }));
  };

  const handleMatchKeywordsChange = (val) => {
    const arr = val.split(",").map((s) => s.trim()).filter(Boolean);
    setForm((prev) => ({ ...prev, matchKeywords: arr }));
  };

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
            Manage all banners across Homepage carousel, Spotlight promos, and Category pages.
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

      {/* ── Section Tabs ── */}
      <div className="flex flex-wrap items-center gap-2">
        {SECTION_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const count = sectionCounts[opt.value] || 0;
          const isActive = activeSection === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setActiveSection(opt.value)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border transition-all"
              style={{
                backgroundColor: isActive ? "var(--admin-primary)" : "transparent",
                color: isActive ? "#ffffff" : "var(--admin-text-secondary)",
                borderColor: isActive ? "var(--admin-primary)" : "var(--admin-border)",
              }}
            >
              <Icon size={15} />
              <span>{opt.label}</span>
              <span
                className="px-1.5 py-0.5 rounded-md text-[11px] font-bold"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "var(--admin-input-bg)",
                  color: isActive ? "#ffffff" : "var(--admin-text-muted)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Description */}
      <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: "var(--admin-input-bg)", color: "var(--admin-text-secondary)" }}>
        <strong className="font-bold" style={{ color: "var(--admin-text-primary)" }}>
          {SECTION_OPTIONS.find((o) => o.value === activeSection)?.label}:
        </strong>{" "}
        {SECTION_OPTIONS.find((o) => o.value === activeSection)?.desc}
      </div>

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
            placeholder="Search by title, badge, category, or link..."
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
            No {SECTION_OPTIONS.find((o) => o.value === activeSection)?.label} Found
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--admin-text-secondary)" }}>
            {searchQuery ? "Try changing your search keywords." : `Add your first ${SECTION_OPTIONS.find((o) => o.value === activeSection)?.label.toLowerCase()} banner.`}
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

                {/* Top Badge, Section & Order */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/50 text-white/80 uppercase tracking-wider">
                      {(banner.section || "carousel").replace("_", " ")}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-black/50 text-white/90">
                      #{banner.order}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-sm">
                  <h3
                    className="text-lg sm:text-xl font-bold tracking-tight m-0 leading-snug"
                    style={{ color: banner.textColor || "#ffffff" }}
                  >
                    {banner.headline || banner.title}
                  </h3>
                  {(banner.subtitle || banner.subheadItems) && (
                    <p
                      className="text-xs sm:text-sm mt-1 mb-3 line-clamp-2"
                      style={{ color: banner.subtitleColor || "rgba(255,255,255,0.85)" }}
                    >
                      {banner.subtitle || banner.subheadItems}
                    </p>
                  )}

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-sm"
                    style={{
                      backgroundColor: banner.buttonBg || "#0284c7",
                      color: banner.buttonText || "#ffffff",
                    }}
                  >
                    <span>{banner.cta || banner.ctaText || "BOOK"}</span>
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
                  <span className="font-mono max-w-[200px] truncate" style={{ color: "var(--admin-detail-text)" }}>
                    {banner.link || banner.ctaLink || "-"}
                  </span>
                  {banner.category && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: "var(--admin-input-bg)", color: "var(--admin-text-muted)" }}>
                      {banner.category}
                    </span>
                  )}
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
              Configure banner content, styling, and placement section.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Section Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                  Banner Section *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SECTION_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, section: opt.value })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all"
                        style={{
                          backgroundColor: form.section === opt.value ? "var(--admin-primary)" : "transparent",
                          color: form.section === opt.value ? "#ffffff" : "var(--admin-text-secondary)",
                          borderColor: form.section === opt.value ? "var(--admin-primary)" : "var(--admin-border)",
                        }}
                      >
                        <Icon size={13} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

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

              {/* Category Key & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Category Key
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. wedding, salon, ac"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
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
              </div>

              {/* ── Spotlight & Category Page Extra Fields ── */}
              {(form.section === "spotlight" || form.section === "category_page") && (
                <div className="mt-2 p-4 rounded-xl space-y-4" style={{ backgroundColor: "var(--admin-input-bg)", border: "1px solid var(--admin-border)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} style={{ color: "var(--admin-primary)" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-primary)" }}>
                      {form.section === "spotlight" ? "Spotlight Promo Fields" : "Category Page Fields"}
                    </span>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                      Headline
                    </label>
                    <input
                      type="text"
                      value={form.headline}
                      onChange={(e) => setForm({ ...form, headline: e.target.value })}
                      placeholder="e.g. Plan Your Perfect Wedding."
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>

                  {/* Subhead Label & Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                        Subhead Label
                      </label>
                      <input
                        type="text"
                        value={form.subheadLabel}
                        onChange={(e) => setForm({ ...form, subheadLabel: e.target.value })}
                        placeholder="e.g. Find trusted services for your special day:"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                        Subhead Items
                      </label>
                      <input
                        type="text"
                        value={form.subheadItems}
                        onChange={(e) => setForm({ ...form, subheadItems: e.target.value })}
                        placeholder="Venues • Decorators • Photographers"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Bullets (one per line) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                      Feature Bullets (one per line, include emoji)
                    </label>
                    <textarea
                      value={(form.bullets || []).join("\n")}
                      onChange={(e) => handleBulletsChange(e.target.value)}
                      placeholder={"💍 Trusted Service Providers\n✨ Multiple Options\n📅 Easy Booking"}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-y"
                      style={inputStyle}
                    />
                  </div>

                  {form.section === "spotlight" && (
                    <>
                      {/* Tag, CTA Text & CTA Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            Pill Tag Label
                          </label>
                          <input
                            type="text"
                            value={form.tag}
                            onChange={(e) => setForm({ ...form, tag: e.target.value })}
                            placeholder="e.g. Wedding & Celebration"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={form.ctaText}
                            onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                            placeholder="Book Wedding Services →"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            CTA Link
                          </label>
                          <input
                            type="text"
                            value={form.ctaLink}
                            onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                            placeholder="/category/wedding"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none font-mono"
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Theme & Tag Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            Theme Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={form.themeColor || "#0284c7"} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                            <input type="text" value={form.themeColor} onChange={(e) => setForm({ ...form, themeColor: e.target.value })} className="flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none" style={inputStyle} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            Tag Bg Color
                          </label>
                          <input type="text" value={form.tagBg} onChange={(e) => setForm({ ...form, tagBg: e.target.value })} placeholder="rgba(225, 29, 72, 0.1)" className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none" style={inputStyle} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            Tag Text Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={form.tagColor || "#0284c7"} onChange={(e) => setForm({ ...form, tagColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                            <input type="text" value={form.tagColor} onChange={(e) => setForm({ ...form, tagColor: e.target.value })} className="flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none" style={inputStyle} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {form.section === "category_page" && (
                    <>
                      {/* Match Keywords & Badge Style */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            Match Keywords (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={(form.matchKeywords || []).join(", ")}
                            onChange={(e) => handleMatchKeywordsChange(e.target.value)}
                            placeholder="ac, appliance, air conditioner"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none font-mono"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                            Badge CSS Classes
                          </label>
                          <input
                            type="text"
                            value={form.badgeStyle}
                            onChange={(e) => setForm({ ...form, badgeStyle: e.target.value })}
                            placeholder="bg-sky-100 text-sky-700 border-sky-200/80"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none font-mono"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Button CTA & Colors (Carousel) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    CTA Button Label
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Button Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.buttonBg?.startsWith("#") ? form.buttonBg : "#0284c7"}
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
                  Visible on Platform
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
              Are you sure you want to delete this banner? It will immediately disappear from the platform.
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
