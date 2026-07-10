import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const ROLE_COLORS = {
  admin: "#ec4899",
  provider: "#22c55e",
  client: "#3b82f6",
};

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [actioningId, setActioningId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
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
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert(err.response?.data?.message || "Failed to update role");
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
          style={{ borderColor: "rgba(255,255,255,0.06)", borderTopColor: "var(--color-primary)" }} />
        <span className="text-xs text-muted" style={{ color: "rgba(255,255,255,0.3)" }}>Loading user list...</span>
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
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>User Accounts</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
            Monitor registrations, assign roles, and audit access permissions.
          </p>
        </div>
        
        {/* Statistics badge */}
        <div className="flex gap-4">
          <div className="px-5 py-2.5 rounded-2xl border flex flex-col items-center" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] uppercase font-bold" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Total Users</span>
            <span className="text-lg font-bold text-white mt-0.5">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Utilities panel */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl border outline-none text-white text-sm"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
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
                backgroundColor: selectedRole === role ? "var(--color-primary)" : "rgba(255,255,255,0.02)",
                color: selectedRole === role ? "#fff" : "rgba(255,255,255,0.45)",
                borderColor: selectedRole === role ? "var(--color-primary)" : "rgba(255,255,255,0.06)",
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["User Details", "Role Status", "Joined Date", "Role Actions"].map((h) => (
                  <th key={h} className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
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
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      className="hover:bg-white/[0.01] transition-all"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                          style={{ backgroundColor: ROLE_COLORS[u.role] || "#777" }}>
                          {u.name ? u.name[0].toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="m-0 text-sm font-semibold text-white">{u.name || "Unnamed User"}</p>
                          <p className="m-0 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{u.email}</p>
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
                      <td className="px-6 py-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Role toggles */}
                          {u.role !== "admin" && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleRoleChange(u._id, "admin")}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border hover:bg-white/5 transition-all text-white"
                              style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "transparent" }}
                            >
                              Make Admin
                            </button>
                          )}
                          {u.role === "admin" && u._id !== currentAdmin?._id && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleRoleChange(u._id, "client")}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border hover:bg-white/5 transition-all"
                              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", backgroundColor: "transparent" }}
                            >
                              Revoke Admin
                            </button>
                          )}
                          
                          {/* Delete user */}
                          {u._id !== currentAdmin?._id && (
                            <button
                              disabled={actioningId === u._id}
                              onClick={() => handleDeleteUser(u._id)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-all hover:bg-red-500/10"
                              style={{ borderColor: "rgba(239,68,68,0.2)", color: "#ef4444", backgroundColor: "transparent" }}
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
                    <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
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
