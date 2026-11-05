import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useUser } from "../contexts/UserContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
