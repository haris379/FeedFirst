import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.role === "admin") return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
