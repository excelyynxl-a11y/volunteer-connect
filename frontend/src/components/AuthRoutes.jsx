import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import LoadingPage from "../pages/LoadingPage/LoadingPage";

const ROLE_DASHBOARD_PATHS = {
  volunteer: "/volunteer-dashboard",
  organisation: "/organisation-dashboard",
  admin: "/admin-dashboard",
};

const getDashboardPath = (role) => ROLE_DASHBOARD_PATHS[role] || "/";

export const ProtectedRoute = () => {
  const { authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return <LoadingPage message="Checking your session..." />;
  }

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (authUser.approvalStatus !== "approved") {
    return (
      <Navigate
        to="/pending-approval"
        replace
        state={{ status: authUser.approvalStatus }}
      />
    );
  }

  return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }) => {
  const authUser = useAuthStore((state) => state.authUser);

  if (!allowedRoles.includes(authUser.role)) {
    return <Navigate to={getDashboardPath(authUser.role)} replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <LoadingPage message="Checking your session..." />;
  }

  if (authUser?.approvalStatus === "approved") {
    return <Navigate to={getDashboardPath(authUser.role)} replace />;
  }

  return <Outlet />;
};

