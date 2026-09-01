import { useState, useEffect } from "react";
import api from "../../config/api";
import { Pencil, Power, Trash2, Layers, Hash, Hourglass } from "lucide-react";

const VERTICALS = ["WEDDING", "VEHICLE_RENTAL", "CCTV_SECURITY", "HOME_TUITION", "HOUSE_HELP"];
const TYPES = ["SERVICE_ONLY", "PRODUCT_ONLY", "BOTH"];

const emptyCategory = {
  name: "",
  description: "",
  vertical: "WEDDING",
  type: "BOTH",
  imageUrl: "",
  secondaryImageUrl: "",
  displayOrder: 0,
  active: true,
  subCategories: [],
};

const emptySubCategory = {
  name: "",
  description: "",
  vertical: "",
  type: "SERVICE_ONLY",
  imageUrl: "",
  secondaryImageUrl: "",
  displayOrder: 0,
  active: true,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyCategory });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Subcategory form
  const [newSub, setNewSub] = useState({ ...emptySubCategory });
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleImageUpload = async (file, fieldName, isSub = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setUploadingImg(true);
      try {
        const { data } = await api.post("/admin/upload", { image: reader.result });
        if (isSub) {
          setNewSub((prev) => ({ ...prev, [fieldName]: data.url }));
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/categories");
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
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
    setForm({ ...emptyCategory });
    setShowForm(true);
  };

  const openEditForm = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name || "",
      description: cat.description || "",
      vertical: cat.vertical || "WEDDING",
      type: cat.type || "BOTH",
      imageUrl: cat.imageUrl || "",
      secondaryImageUrl: cat.secondaryImageUrl || "",
      displayOrder: cat.displayOrder || 0,
      active: cat.active !== undefined ? cat.active : true,
      subCategories: cat.subCategories || [],
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyCategory });
    setNewSub({ ...emptySubCategory });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, form);
        showMessage("Category updated successfully!");
      } else {
        await api.post("/admin/categories", form);
        showMessage("Category created successfully!");
      }
      closeForm();
      fetchCategories();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      showMessage("Category deleted successfully!");
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/categories/${id}/toggle`);
      showMessage(data.message);
      fetchCategories();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to toggle", "error");
    }
  };

  // Toggle "Coming Soon" mode — when ON, the category's services show as
  // Coming Soon on the user-facing frontend (non-bookable).
  const handleComingSoonToggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/categories/${id}/coming-soon`);
      showMessage(data.message);
      fetchCategories();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to toggle Coming Soon mode", "error");
    }
  };

  // Subcategory helpers
  const addSubCategory = () => {
    if (newSub.name.trim()) {
      setForm((prev) => ({
        ...prev,
        subCategories: [...prev.subCategories, { ...newSub, vertical: prev.vertical }],
      }));
      setNewSub({ ...emptySubCategory });
    }
  };

  const removeSubCategory = (idx) => {
    setForm((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "40vh" }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--color-primary)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white m-0 mb-1" style={{ fontFamily: "var(--font-display)" }}>Categories</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
            Manage service categories and subcategories
          </p>
        </div>
        <button onClick={openAddForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90" style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
          + Add Category
        </button>
      </div>

      {/* Messages */}
      {success && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "var(--font-body)" }}>{success}</div>}
      {error && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "var(--font-body)" }}>{error}</div>}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat._id} className="group rounded-[24px] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ backgroundColor: "var(--color-bg-soft)", border: "1px solid var(--color-border)" }}>
            {/* Image Header */}
            {cat.imageUrl ? (
              <div className="relative h-40 overflow-hidden flex-shrink-0">
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,16,0.88) 0%, rgba(8,8,16,0.32) 50%, rgba(8,8,16,0.05) 75%)" }} />
                {/* Hover shine sweep */}
                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                {/* Status pill */}
                <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md" style={{ backgroundColor: cat.active ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)", color: cat.active ? "#4ade80" : "#f87171", border: `1px solid ${cat.active ? "rgba(74,222,128,0.35)" : "rgba(248,113,113,0.35)"}` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.active ? "#4ade80" : "#f87171", boxShadow: `0 0 6px ${cat.active ? "#4ade80" : "#f87171"}` }} />
                  {cat.active ? "Active" : "Inactive"}
                </span>
                {/* Chips + Name */}
                <div className="absolute bottom-3.5 left-4 right-4">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }}>{cat.vertical?.replace("_", " ")}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ backgroundColor: "rgba(245,158,11,0.28)", color: "#fcd34d", border: "1px solid rgba(252,211,77,0.32)" }}>{cat.type?.replace("_", " ")}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white qs-on-media m-0 tracking-tight" style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{cat.name}</h3>
                </div>
              </div>
            ) : (
              <div className="relative h-28 flex items-center justify-center gap-3 overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 100%)", borderBottom: "1px solid var(--color-border)" }}>
                <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider" style={{ backgroundColor: cat.active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: cat.active ? "#22c55e" : "#ef4444" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.active ? "#22c55e" : "#ef4444" }} />
                  {cat.active ? "Active" : "Inactive"}
                </span>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-extrabold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", fontFamily: "var(--font-display)" }}>
                  {cat.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-extrabold m-0 tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>{cat.name}</h3>
              </div>
            )}

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
              <p className="text-xs m-0 mb-4 leading-relaxed" style={{ color: "var(--color-text-mid)", fontFamily: "var(--font-body)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {cat.description || "No description"}
              </p>

              {/* Meta chips */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {!cat.imageUrl && (
                  <>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8" }}>{cat.vertical?.replace("_", " ")}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>{cat.type?.replace("_", " ")}</span>
                  </>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: "rgba(99,102,241,0.12)", color: "#818cf8", fontFamily: "var(--font-body)" }}>
                  <Layers size={11} />
                  {cat.subCategories?.length || 0} Subcategories
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b", fontFamily: "var(--font-body)" }}>
                  <Hash size={11} />
                  Order {cat.displayOrder}
                </span>
                {cat.comingSoon && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#fbbf24", fontFamily: "var(--font-body)" }}>
                    <Hourglass size={11} />
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto">
                <button onClick={() => openEditForm(cat)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-85" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8", fontFamily: "var(--font-body)" }}>
                  <Pencil size={12} />
                  Edit
                </button>
                <button onClick={() => handleToggle(cat._id)} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs border-0 cursor-pointer transition-all duration-200 hover:opacity-85" style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-mid)", fontFamily: "var(--font-body)" }}>
                  <Power size={12} />
                  {cat.active ? "Disable" : "Enable"}
                </button>
                {/* Coming Soon toggle */}
                <button
                  onClick={() => handleComingSoonToggle(cat._id)}
                  title={cat.comingSoon ? "Turn off Coming Soon mode — make services bookable" : "Turn on Coming Soon mode — hide services from booking on the frontend"}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs border-0 cursor-pointer transition-all duration-200 hover:opacity-85"
                  style={{
                    backgroundColor: cat.comingSoon ? "rgba(245,158,11,0.22)" : "var(--color-border)",
                    color: cat.comingSoon ? "#fbbf24" : "var(--color-text-mid)",
                    fontFamily: "var(--font-body)",
                    fontWeight: cat.comingSoon ? 700 : 400,
                  }}
                >
                  <Hourglass size={12} />
                  {cat.comingSoon ? "Coming Soon: ON" : "Coming Soon"}
                </button>
                <button onClick={() => setDeleteConfirm(cat._id)} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs border-0 cursor-pointer transition-all duration-200 hover:opacity-85" style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444", fontFamily: "var(--font-body)" }}>
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12" style={{ color: "var(--color-text-mid)", fontFamily: "var(--font-body)" }}>
            No categories found. Click "Add Category" to create one.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "#1e1e26", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>Delete Category?</h3>
            <p className="text-sm mb-6" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.5)" }}>
              This will fail if any services reference this category. Remove or reassign services first.
            </p>
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
          <div className="rounded-2xl p-6 sm:p-8 max-w-2xl w-full mx-4 my-8" style={{ backgroundColor: "#1e1e26", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <button onClick={closeForm} className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer text-white text-lg" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name & Vertical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Category Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="e.g. Wedding & Party Services" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Vertical *</label>
                  <select value={form.vertical} onChange={(e) => setForm((p) => ({ ...p, vertical: e.target.value }))} required style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none">
                    {VERTICALS.map((v) => <option key={v} value={v}>{v.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="Category description" />
              </div>

              {/* Type & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Type</label>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none">
                    {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Display Order</label>
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} min={0} style={inputStyle} className="w-full px-3 py-2.5 rounded-xl text-sm border-0 outline-none" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 cursor-pointer" />
                    <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Active</span>
                  </label>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Primary Image</label>
                  <div className="flex gap-2">
                    <input type="url" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} style={inputStyle} className="flex-1 px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="https://..." />
                    <label className="px-4 py-2.5 rounded-xl text-xs font-semibold border-0 cursor-pointer flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 whitespace-nowrap">
                      {uploadingImg ? "Uploading..." : "Upload"}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], "imageUrl")} className="hidden" disabled={uploadingImg} />
                    </label>
                  </div>
                  {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 w-24 h-16 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={labelStyle}>Secondary Image</label>
                  <div className="flex gap-2">
                    <input type="url" value={form.secondaryImageUrl} onChange={(e) => setForm((p) => ({ ...p, secondaryImageUrl: e.target.value }))} style={inputStyle} className="flex-1 px-3 py-2.5 rounded-xl text-sm border-0 outline-none" placeholder="https://..." />
                    <label className="px-4 py-2.5 rounded-xl text-xs font-semibold border-0 cursor-pointer flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 whitespace-nowrap">
                      {uploadingImg ? "Uploading..." : "Upload"}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], "secondaryImageUrl")} className="hidden" disabled={uploadingImg} />
                    </label>
                  </div>
                  {form.secondaryImageUrl && <img src={form.secondaryImageUrl} alt="preview" className="mt-2 w-24 h-16 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />}
                </div>
              </div>

              {/* Subcategories */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Subcategories</label>
                {form.subCategories.map((sub, i) => (
                  <div key={i} className="rounded-xl p-3 mb-2 flex items-center justify-between" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-3">
                      {sub.imageUrl && <img src={sub.imageUrl} alt={sub.name} className="w-10 h-10 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />}
                      <div>
                        <p className="text-sm font-semibold text-white m-0">{sub.name}</p>
                        <p className="text-xs m-0" style={{ color: "rgba(255,255,255,0.3)" }}>{sub.type?.replace("_", " ")} • Order: {sub.displayOrder}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeSubCategory(i)} className="text-xs border-0 bg-transparent cursor-pointer" style={{ color: "#ef4444" }}>Remove</button>
                  </div>
                ))}

                <div className="rounded-xl p-4 mt-2" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <p className="text-xs font-semibold mb-3 m-0" style={{ color: "rgba(255,255,255,0.5)" }}>Add Subcategory</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input type="text" value={newSub.name} onChange={(e) => setNewSub((p) => ({ ...p, name: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm border-0 outline-none" placeholder="Name" />
                    <select value={newSub.type} onChange={(e) => setNewSub((p) => ({ ...p, type: e.target.value }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm border-0 outline-none">
                      {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <input type="text" value={newSub.description} onChange={(e) => setNewSub((p) => ({ ...p, description: e.target.value }))} style={inputStyle} className="w-full px-3 py-2 rounded-lg text-sm border-0 outline-none mb-3" placeholder="Description" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="flex gap-2">
                      <input type="url" value={newSub.imageUrl} onChange={(e) => setNewSub((p) => ({ ...p, imageUrl: e.target.value }))} style={inputStyle} className="flex-1 px-3 py-2 rounded-lg text-sm border-0 outline-none" placeholder="Image URL" />
                      <label className="px-3 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 whitespace-nowrap">
                        {uploadingImg ? "Uploading..." : "Upload"}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], "imageUrl", true)} className="hidden" disabled={uploadingImg} />
                      </label>
                    </div>
                    <input type="number" value={newSub.displayOrder} onChange={(e) => setNewSub((p) => ({ ...p, displayOrder: Number(e.target.value) }))} style={inputStyle} className="px-3 py-2 rounded-lg text-sm border-0 outline-none" placeholder="Display order" />
                  </div>
                  <button type="button" onClick={addSubCategory} className="px-4 py-1.5 rounded-lg text-xs border-0 cursor-pointer font-semibold" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                    Add Subcategory
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={closeForm} className="px-5 py-2.5 rounded-xl text-sm border-0 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90" style={{ backgroundColor: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-body)", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
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

export default AdminCategories;
