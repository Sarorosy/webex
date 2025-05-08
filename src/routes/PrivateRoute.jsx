import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/idb.jsx";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" />;
}
