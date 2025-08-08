import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/idb.jsx";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-10">Loading...</div>;

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0]; 
  };

  const loginDate = user?.login_date?.split("T")[0]; 
  const todayDate = getTodayDate();

  const isValidLogin = user && loginDate === todayDate;

  return isValidLogin ? <Outlet /> : <Navigate to="/login" />;
}
