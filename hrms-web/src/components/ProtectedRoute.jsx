import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../stores/authStore";
import { verifyUser } from "../api/auth";
import Loading from "./Loading";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, loginSuccess, logout } = useAuthStore();

  const { isLoading } = useQuery({
    queryKey: ["verifyAuth", location.pathname],
    queryFn: () =>
      verifyUser()
        .then((data) => {
          loginSuccess(data.user);
          return data;
        })
        .catch((error) => {
          toast.error(error.response.data.message);
          logout();
        }),
    retry: false,
    staleTime: 500,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
