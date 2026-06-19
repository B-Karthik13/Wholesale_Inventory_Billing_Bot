import { Navigate } from "react-router-dom";
import { useAuth } from "../store/authStore.js";

function ProtectedRoute({ children }) {
  const { currentUser, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading WholesaleIQ...</p>
        </div>
      </div>
    );
  }

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
