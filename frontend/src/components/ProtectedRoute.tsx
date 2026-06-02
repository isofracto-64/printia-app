import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactElement;
  role?: "admin" | "user" | "kiosk";
  type?: "remote" | "kiosk";
}

export default function ProtectedRoute({
  children,
  role,
  type,
}: ProtectedRouteProps) {
  const kioskToken = localStorage.getItem("kiosk_token");
  const kioskInfo = JSON.parse(localStorage.getItem("kiosk_info") || "{}");

  const userToken = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  if (type === "remote" && !kioskToken) {
    return <Navigate to="/kiosk/setup" />;
  }

  if (type === "kiosk" && !userToken) {
    return <Navigate to="/kiosk" />;
  }

  if (!type && role && !userToken && !kioskToken) {
    return <Navigate to="/" />;
  }

  if (role) {
    const activeRole = (userInfo.role || kioskInfo.role || "").toLowerCase();
    const expectedRole = role.toLowerCase();
    const adminCanUseUserRoute = expectedRole === "user" && activeRole === "admin";
    if (activeRole !== expectedRole && !adminCanUseUserRoute) {
      return <Navigate to="/" />;
    }
  }

  return children;
}
