import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { Search } from "lucide-react";

const ROLE_COLORS = {
  admin: "#ec4899",
  provider: "#22c55e",
  client: "#3b82f6",
  user: "#3b82f6",
};

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [actioningId, setActioningId] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess("");
    } else {
      setSuccess(msg);
      setError("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      showMessage("Failed to load users", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchUsers();
    });
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setActioningId(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: data.user.role } : u))
      );
      showMessage(`User role updated to ${data.user.role}`);
    } catch (err) {
      console.error("Failed to update user role:", err);
      showMessage(err.response?.data?.message || "Failed to update role", true);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentAdmin?._id) {
      alert("You cannot delete your own admin account!");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this user?")) {
      return;
    }
    setActioningId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActioningId(null);
    }
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedRole === "ALL") return matchesSearch;
    return u.role === selectedRole.toLowerCase() && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-mid)" }}>Loading user list...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>User Accounts</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            Monitor registrations, assign roles, and audit access permissions.
          </p>
        </div>
        
        {/* Statistics badge */}
        <div className="flex gap-4">
          <div className="px-5 py-2.5 rounded-2xl border flex flex-col items-center" style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: "var(--color-text-mid)", fontFamily: "var(--font-body)" }}>Total Users</span>
            <span className="text-lg font-bold mt-0.5" style={{ color: "var(--color-text-dark)" }}>{users.length}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", fontFamily: "var(--font-body)" }}>{success}</div>}
      {error && <div className="px-4 py-3 rounded-xl text-sm mb-4" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "var(--font-body)" }}>{error}</div>}

      {/* Utilities panel */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 pr-10 rounded-2xl border outline-none text-sm"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-bg-soft)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-dark)",
            }}
          />
          <Search size={14} className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-mid)" }} />
        </div>

        {/* Role Pills */}
        <div className="flex gap-2 self-start sm:self-auto overflow-x-auto max-w-full">
          {["ALL", "CLIENT", "PROVIDER", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: selectedRole === role ? "var(--color-primary)" : "var(--color-bg-soft)",
                color: selectedRole === role ? "#fff" : "var(--color-text-mid)",
                borderColor: selectedRole === role ? "var(--color-primary)" : "var(--color-border)",
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["User Details", "Role Status", "Joined Date", "Role Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-mid)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                      className="transition-all"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                          style={{ backgroundColor: ROLE_COLORS[u.role] || "#777" }}>
                          {u.name ? u.name[0].toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="m-0 text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>{u.name || "Unnamed User"}</p>
                          <p className="m-0 text-xs" style={{ color: "var(--color-text-mid)" }}>{u.email}</p>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${ROLE_COLORS[u.role] || "#777"}15`,
                            color: ROLE_COLORS[u.role] || "#777",
                            border: `1px solid ${ROLE_COLORS[u.role] || "#777"}30`,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs" style={{ color: "var(--color-text-mid)" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Make Admin */}
                          {u.role !== "admin" && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleRoleChange(u._id, "admin")}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all hover:opacity-80"
                              style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--admin-text-primary)", border: "1px solid rgba(99,102,241,0.4)" }}
                            >
                              Make Admin
                            </button>
                          )}
                          {/* Revoke Admin */}
                          {u.role === "admin" && u._id !== currentAdmin?._id && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleRoleChange(u._id, "client")}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all hover:opacity-80"
                              style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-secondary)", border: "1px solid var(--admin-border-focus)" }}
                            >
                              Revoke Admin
                            </button>
                          )}
                          {/* Make Provider */}
                          {u.role !== "provider" && u.role !== "admin" && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleRoleChange(u._id, "provider")}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all hover:opacity-80"
                              style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "var(--admin-text-primary)", border: "1px solid rgba(34,197,94,0.4)" }}
                            >
                              Make Provider
                            </button>
                          )}
                          {/* Revoke Provider */}
                          {u.role === "provider" && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleRoleChange(u._id, "client")}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all hover:opacity-80"
                              style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-secondary)", border: "1px solid var(--admin-border-focus)" }}
                            >
                              Revoke Provider
                            </button>
                          )}
                          {/* Delete */}
                          {u._id !== currentAdmin?._id && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleDeleteUser(u._id)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-all hover:opacity-80"
                              style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "var(--admin-text-primary)", border: "1px solid rgba(239,68,68,0.5)" }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: "var(--color-text-mid)" }}>
                      No registered users found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
