import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../stores/authStore";
import { verifyUser } from "../api/auth";
import Loading from "./Loading";
import toast from "react-hot-toast";
import { lazy, Suspense } from "react";
const AccessDenied = lazy(() => import("../pages/AccessDenied"));

const ProtectedRoute = ({ children }) => {
 
  console.log("protect")
  const location = useLocation();
  const { isAuthenticated, loginSuccess, logout, permissions } = useAuthStore();

  const { isLoading } = useQuery({
    queryKey: ["verifyAuth", location.pathname],
    queryFn: () =>
      verifyUser()
        .then((data) => {
         
          loginSuccess(
            data.user,
            Array.isArray(data.permissions) ? data.permissions : [],
            data.employeeId?.employeeId
          );
          return data;
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || "Authentication failed");
          logout();
          throw error;
        }),
    retry: false,
    staleTime: 500,
    refetchOnWindowFocus: false,
  });

  // Check if current route exists in permissions
  const hasAccess = permissions?.some(
    (permission) => permission.url === location.pathname
  );

  if (isLoading) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasAccess) {
    return (
      <Suspense fallback={<Loading />}>
        <AccessDenied />
      </Suspense>
    );
  }

  return children;
};

export default ProtectedRoute;





 