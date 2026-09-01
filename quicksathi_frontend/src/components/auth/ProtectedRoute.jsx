import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminLogin from "../../admin/pages/AdminLogin";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }}
        />
      </div>
    );
  }

  // If this is an admin route and the user is not authenticated as admin,
  // render the dedicated Admin Login portal directly at this URL (/admin)
  if (requiredRole === "admin") {
    if (!isAuthenticated || user?.role !== "admin") {
      return <AdminLogin />;
    }
  }

  // Provider routes
  if (requiredRole === "provider") {
    if (!isAuthenticated) {
      return <Navigate to="/login?mode=provider" state={{ from: location }} replace />;
    }
    if (user?.role !== "provider" && user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  }

  // General authenticated routes
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;

