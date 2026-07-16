import { useState, useEffect } from "react";
import api from "../../config/api";
import { CITY_OPTIONS } from "../../context/LocationContext";

const SERVICE_MODES = ["ON_SITE", "AT_HOME", "RENTAL", "REMOTE"];

const emptyService = {
  name: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  category: "",
  categoryName: "",
  thumbnail: "",
  bannerImage: "",
  gallery: [],
  startingPrice: 0,
  priceUnit: "per service",
  rating: 0,
  totalReviews: 0,
  experience: "",
  available: true,
  serviceMode: "ON_SITE",
  tags: [],
  featured: false,
  packages: [],
  faqs: [],
  cities: [],
};

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyService });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Temp fields for adding
  const [newTag, setNewTag] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleImageUpload = async (file, fieldName, isGallery = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setUploadingImg(true);
      try {
        const { data } = await api.post("/admin/upload", { image: reader.result });
        if (isGallery) {
          setNewGalleryUrl(data.url);
        } else {
          setForm((prev) => ({ ...prev, [fieldName]: data.url }));
        }
      } catch (err) {
        console.error("Failed to upload image:", err);
        alert("Image upload failed. Please try again.");
      } finally {
        setUploadingImg(false);
      }
    };
  };

  const [newPackage, setNewPackage] = useState({ title: "", price: 0, features: [] });
  const [newPkgFeature, setNewPkgFeature] = useState("");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/services?limit=200");
      setServices(data.services || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data);
    } catch {
      // Categories might not load if none exist
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchServices();
      fetchCategories();
    });
  }, []);

  const showMessage = (msg, type = "success") => {
    if (type === "success") { setSuccess(msg); setError(""); }
    else { setError(msg); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyService });
    setShowForm(true);
  };

  const openEditForm = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name || "",
      slug: service.slug || "",
      shortDescription: service.shortDescription || "",
      fullDescription: service.fullDescription || "",
      category: service.category || "",
      categoryName: service.categoryName || "",
      thumbnail: service.thumbnail || "",
      bannerImage: service.bannerImage || "",
      gallery: service.gallery || [],
      startingPrice: service.startingPrice || 0,
      priceUnit: service.priceUnit || "per service",
      rating: service.rating || 0,
      totalReviews: service.totalReviews || 0,
      experience: service.experience || "",
      available: service.available !== undefined ? service.available : true,
      serviceMode: service.serviceMode || "ON_SITE",
      tags: service.tags || [],
      featured: service.featured || false,
      packages: service.packages || [],
      faqs: service.faqs || [],
      cities: service.cities || [],
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyService });
    setNewTag("");
    setNewGalleryUrl("");
    setNewPackage({ title: "", price: 0, features: [] });
    setNewPkgFeature("");
    setNewFaq({ question: "", answer: "" });
  };

  const handleCategoryChange = (catId) => {
    const cat = categories.find((c) => c._id === catId);
    setForm((prev) => ({
      ...prev,
      category: catId,
      categoryName: cat?.name || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/services/${editingId}`, form);
        showMessage("Service updated successfully!");
      } else {
        await api.post("/admin/services", form);
        showMessage("Service created successfully!");
      }
      closeForm();
      fetchServices();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to save service", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/services/${id}`);
      showMessage("Service deleted successfully!");
      setDeleteConfirm(null);
      fetchServices();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/services/${id}/toggle`);
      showMessage(data.message);
      fetchServices();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to toggle", "error");
    }
  };

  // Tag helpers
  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };
  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  // Gallery helpers
  const addGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, newGalleryUrl.trim()] }));
      setNewGalleryUrl("");
    }
  };
  const removeGalleryUrl = (idx) => {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
  };

  // Package helpers
  const addPackageFeature = () => {
    if (newPkgFeature.trim()) {
      setNewPackage((prev) => ({ ...prev, features: [...prev.features, newPkgFeature.trim()] }));
      setNewPkgFeature("");
    }
  };
  const addPackage = () => {
    if (newPackage.title.trim()) {
      setForm((prev) => ({ ...prev, packages: [...prev.packages, { ...newPackage }] }));
      setNewPackage({ title: "", price: 0, features: [] });
    }
  };
  const removePackage = (idx) => {
    setForm((prev) => ({ ...prev, packages: prev.packages.filter((_, i) => i !== idx) }));
  };

  // FAQ helpers
  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setForm((prev) => ({ ...prev, faqs: [...prev.faqs, { ...newFaq }] }));
      setNewFaq({ question: "", answer: "" });
    }
  };
  const removeFaq = (idx) => {
    setForm((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) }));
  };

  const filteredServices = searchQuery
    ? services.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : services;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "40vh" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "#8b1a1a" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white m-0 mb-1" style={{ fontFamily: "var(--font-display)" }}>Services</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
            Manage all service cards — add, edit, delete, toggle availability
          </p>
        </div>
        <button onClick={openAddForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90" style={{ fontFamily: "var(--font-body)", backgroundColor: "#8b1a1a", color: "#fff" }}>
          + Add Service
        </button>
      </div>

      {/* Messages */}
      {success && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "var(--font-body)" }}>{success}</div>}
      {error && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "var(--font-body)" }}>{error}</div>}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services by name or category..."
          className="w-full max-w-md px-4 py-2.5 rounded-xl text-sm border-0 outline-none"
          style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" }}
        />
      </div>

      {/* Services Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr>
                {["Image", "Name", "Category", "Price", "Rating", "Cities", "Status", "Featured", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3">
                    {service.thumbnail ? (
                      <img src={service.thumbnail} alt={service.name} className="w-12 h-12 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>📷</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white m-0 font-semibold">{service.name}</p>
                    <p className="text-xs m-0 mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{service.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{service.categoryName}</td>
                  <td className="px-4 py-3 text-sm text-white font-semibold">₹{service.startingPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>⭐ {service.rating} ({service.totalReviews})</td>
                  <td className="px-4 py-3">
                    {(!service.cities || service.cities.length === 0) ? (
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>🌐 All</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", maxWidth: "160px" }}>
                        {service.cities.slice(0, 3).map((c) => (
                          <span key={c} style={{ padding: "1px 6px", borderRadius: "10px", fontSize: "10px", background: "rgba(232,92,42,0.15)", color: "#e85c2a", border: "1px solid rgba(232,92,42,0.3)" }}>{c}</span>
                        ))}
                        {service.cities.length > 3 && (
                          <span style={{ padding: "1px 6px", borderRadius: "10px", fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>+{service.cities.length - 3}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(service._id)} className="px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer" style={{ backgroundColor: service.available ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: service.available ? "#22c55e" : "#ef4444" }}>
                      {service.available ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">{service.featured ? "⭐" : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditForm(service)} className="px-3 py-1.5 rounded-lg text-xs border-0 cursor-pointer transition-all duration-200 hover:opacity-80" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8", fontFamily: "var(--font-body)" }}>Edit</button>
                      <button onClick={() => setDeleteConfirm(service._id)} className="px-3 py-1.5 rounded-lg text-xs border-0 cursor-pointer transition-all duration-200 hover:opacity-80" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", fontFamily: "var(--font-body)" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No services found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "#1e1e26", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Delete Service?</h3>
            <p className="text-sm mb-6" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.5)" }}>This action cannot be undone. The service will be permanently removed.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-sm border-0 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 rounded-xl text-sm border-0 cursor-pointer font-semibold" style={{ backgroundColor: "#ef4444", color: "#fff", fontFamily: "var(--font-body)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 sm:p-8 max-w-3xl w-full mx-4 my-8" style={{ backgroundColor: "#1e1e26", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>
                {editingId ? "Edit Service" : "Add New Service"}
              </h2>
              <button onClick={closeForm} className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer text-white text-lg" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Service Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="e.g. Photography" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="auto-generated if empty" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Short Description</label>
                <input type="text" value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="Brief one-liner" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Full Description</label>
                <textarea value={form.fullDescription} onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="Detailed description" />
              </div>

              {/* Category & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Category *</label>
                  <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)} required style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none">
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Starting Price *</label>
                  <input type="number" value={form.startingPrice} onChange={(e) => setForm((p) => ({ ...p, startingPrice: Number(e.target.value) }))} required min={0} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Price Unit</label>
                  <input type="text" value={form.priceUnit} onChange={(e) => setForm((p) => ({ ...p, priceUnit: e.target.value }))} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="per event" />
                </div>
              </div>

              {/* Service Cities */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>
                  📍 Available Cities
                  <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
                    (leave empty = available everywhere)
                  </span>
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: "6px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                >
                  {CITY_OPTIONS.map((city) => {
                    const checked = (form.cities || []).includes(city);
                    return (
                      <label
                        key={city}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          cursor: "pointer",
                          padding: "5px 8px",
                          borderRadius: "8px",
                          background: checked ? "rgba(232,92,42,0.15)" : "transparent",
                          border: checked ? "1px solid rgba(232,92,42,0.4)" : "1px solid transparent",
                          transition: "all 0.15s",
                          userSelect: "none",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setForm((prev) => ({
                              ...prev,
                              cities: checked
                                ? prev.cities.filter((c) => c !== city)
                                : [...(prev.cities || []), city],
                            }));
                          }}
                          style={{ accentColor: "#e85c2a", width: "13px", height: "13px" }}
                        />
                        <span
                          style={{
                            color: checked ? "#e85c2a" : "rgba(255,255,255,0.6)",
                            fontSize: "12px",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: checked ? "600" : "400",
                          }}
                        >
                          {city}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {(form.cities || []).length === 0 && (
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "6px", fontFamily: "Inter, sans-serif" }}>
                    🌐 This service will be shown to users in ALL cities.
                  </p>
                )}
                {(form.cities || []).length > 0 && (
                  <p style={{ color: "rgba(232,92,42,0.7)", fontSize: "11px", marginTop: "6px", fontFamily: "Inter, sans-serif" }}>
                    📍 Shown only to users in: {form.cities.join(", ")}
                  </p>
                )}
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Thumbnail</label>
                  <div className="flex gap-2">
                    <input type="url" value={form.thumbnail} onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.value }))} style={inputStyle} className="flex-1 px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="https://..." />
                    <label className="px-4 py-2.5 rounded-xl text-xs font-semibold border-0 cursor-pointer flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 whitespace-nowrap">
                      {uploadingImg ? "Uploading..." : "Upload"}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], "thumbnail")} className="hidden" disabled={uploadingImg} />
                    </label>
                  </div>
                  {form.thumbnail && <img src={form.thumbnail} alt="preview" className="mt-2 w-20 h-14 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Banner Image</label>
                  <div className="flex gap-2">
                    <input type="url" value={form.bannerImage} onChange={(e) => setForm((p) => ({ ...p, bannerImage: e.target.value }))} style={inputStyle} className="flex-1 px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="https://..." />
                    <label className="px-4 py-2.5 rounded-xl text-xs font-semibold border-0 cursor-pointer flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 whitespace-nowrap">
                      {uploadingImg ? "Uploading..." : "Upload"}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], "bannerImage")} className="hidden" disabled={uploadingImg} />
                    </label>
                  </div>
                  {form.bannerImage && <img src={form.bannerImage} alt="preview" className="mt-2 w-20 h-14 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Gallery Images</label>
                <div className="flex gap-2 mb-2">
                  <input type="url" value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)} style={inputStyle} className="flex-1 px-3 py-2 rounded-xl text-sm border-0 outline-none" placeholder="https://..." />
                  <label className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 whitespace-nowrap">
                    {uploadingImg ? "Uploading..." : "Upload File"}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], "", true)} className="hidden" disabled={uploadingImg} />
                  </label>
                  <button type="button" onClick={addGalleryUrl} className="px-4 py-2 rounded-xl text-xs border border-white/10 cursor-pointer font-semibold bg-white/5 text-white hover:bg-white/10">Add Link</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {form.gallery.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`gallery-${i}`} className="w-16 h-12 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                      <button type="button" onClick={() => removeGalleryUrl(i)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-0 cursor-pointer text-xs text-white" style={{ backgroundColor: "#ef4444" }}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Service Mode</label>
                  <select value={form.serviceMode} onChange={(e) => setForm((p) => ({ ...p, serviceMode: e.target.value }))} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none">
                    {SERVICE_MODES.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Experience</label>
                  <input type="text" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="e.g. 5 Years" />
                </div>
                <div className="flex items-end gap-6 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.available} onChange={(e) => setForm((p) => ({ ...p, available: e.target.checked }))} className="w-4 h-4 cursor-pointer" />
                    <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 cursor-pointer" />
                    <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Featured</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Tags</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} style={inputStyle} className="flex-1 px-3 py-2 rounded-xl text-sm border-0 outline-none" placeholder="Add tag" />
                  <button type="button" onClick={addTag} className="px-3 py-2 rounded-xl text-xs border-0 cursor-pointer font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" }}>Add</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5" style={{ backgroundColor: "rgba(139,26,26,0.15)", color: "#e88a8a" }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="border-0 bg-transparent cursor-pointer text-xs" style={{ color: "#e88a8a" }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Packages */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Packages</label>
                {form.packages.map((pkg, i) => (
                  <div key={i} className="rounded-xl p-3 mb-2 flex items-start justify-between" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                    <div>
                      <p className="text-sm font-semibold text-white m-0">{pkg.title} — ₹{pkg.price?.toLocaleString()}</p>
                      <p className="text-xs m-0 mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{pkg.features?.join(" • ")}</p>
                    </div>
                    <button type="button" onClick={() => removePackage(i)} className="text-xs border-0 bg-transparent cursor-pointer" style={{ color: "#ef4444" }}>Remove</button>
                  </div>
                ))}
                <div className="rounded-xl p-3 mt-2" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" value={newPackage.title} onChange={(e) => setNewPackage((p) => ({ ...p, title: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm border-0 outline-none" placeholder="Package title" />
                    <input type="number" value={newPackage.price} onChange={(e) => setNewPackage((p) => ({ ...p, price: Number(e.target.value) }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm border-0 outline-none" placeholder="Price" />
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={newPkgFeature} onChange={(e) => setNewPkgFeature(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPackageFeature())} style={inputStyle} className="flex-1 px-3 py-2 rounded-lg text-sm border-0 outline-none" placeholder="Feature" />
                    <button type="button" onClick={addPackageFeature} className="px-3 py-2 rounded-lg text-xs border-0 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" }}>+</button>
                  </div>
                  {newPackage.features.length > 0 && (
                    <p className="text-xs m-0 mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Features: {newPackage.features.join(", ")}</p>
                  )}
                  <button type="button" onClick={addPackage} className="px-4 py-1.5 rounded-lg text-xs border-0 cursor-pointer font-semibold" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8" }}>Add Package</button>
                </div>
              </div>

              {/* FAQs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>FAQs</label>
                {form.faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl p-3 mb-2 flex items-start justify-between" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                    <div>
                      <p className="text-sm font-semibold text-white m-0">{faq.question}</p>
                      <p className="text-xs m-0 mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{faq.answer}</p>
                    </div>
                    <button type="button" onClick={() => removeFaq(i)} className="text-xs border-0 bg-transparent cursor-pointer" style={{ color: "#ef4444" }}>Remove</button>
                  </div>
                ))}
                <div className="rounded-xl p-3 mt-2" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <input type="text" value={newFaq.question} onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))} style={inputStyle} className="w-full px-3 py-2 rounded-lg text-sm border-0 outline-none mb-2" placeholder="Question" />
                  <input type="text" value={newFaq.answer} onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))} style={inputStyle} className="w-full px-3 py-2 rounded-lg text-sm border-0 outline-none mb-2" placeholder="Answer" />
                  <button type="button" onClick={addFaq} className="px-4 py-1.5 rounded-lg text-xs border-0 cursor-pointer font-semibold" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8" }}>Add FAQ</button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={closeForm} className="px-5 py-2.5 rounded-xl text-sm border-0 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90" style={{ backgroundColor: "#8b1a1a", color: "#fff", fontFamily: "var(--font-body)", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editingId ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle = { fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.4)" };
const inputStyle = { fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" };

export default AdminServices;
