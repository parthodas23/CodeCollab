import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  // remember where the user wanted to go (e.g. an invite link) and come back after login
  return token ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}

export default ProtectedRoute;
