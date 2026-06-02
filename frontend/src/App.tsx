import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyNotice from "./pages/VerifyNotice";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";
import KioskSessionGuard from "./components/KioskSessionGuard";
import KioskTouchKeyboard from "./components/KioskTouchKeyboard";

import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";

import Home from "./pages/user/Home";
import Upload from "./pages/user/Upload";
import History from "./pages/user/History";
import Profile from "./pages/user/Profile";
import Credits from "./pages/user/Credits";
import Location from "./pages/user/Location";
import Support from "./pages/user/Support";

import KioskHome from "./pages/kiosk/KioskHome";
import KioskPrint from "./pages/kiosk/KioskPrint";
import KioskUSBWait from "./pages/kiosk/KioskUSBWait";
import KioskUSBExplorer from "./pages/kiosk/KioskUSBExplorer";
import KioskUSBPreview from "./pages/kiosk/KioskUSBPreview";
import ComingSoon from "./pages/kiosk/ComingSoon";
import KioskProcedures from "./pages/kiosk/KioskProcedures";
import KioskQRScan from "./pages/kiosk/KioskQRScan";

function App() {
  return (
    <BrowserRouter>
      <KioskSessionGuard />
      <KioskTouchKeyboard />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyNotice />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/home"
          element={
            <ProtectedRoute role="user">
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/upload"
          element={
            <ProtectedRoute role="user">
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute role="user">
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute role="user">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/credits"
          element={
            <ProtectedRoute role="user">
              <Credits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/location"
          element={
            <ProtectedRoute role="user">
              <Location />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute role="user">
              <Support />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kiosk"
          element={
            <ProtectedRoute role="kiosk">
              <KioskHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kiosk/usb"
          element={
            <ProtectedRoute role="kiosk">
              <KioskUSBWait />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kiosk/usb/files"
          element={
            <ProtectedRoute role="kiosk">
              <KioskUSBExplorer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kiosk/usb/preview"
          element={
            <ProtectedRoute role="kiosk">
              <KioskUSBPreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kiosk/payments"
          element={
            <ProtectedRoute role="kiosk">
              <KioskProcedures />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kiosk/procedures"
          element={
            <ProtectedRoute role="kiosk">
              <KioskProcedures />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kiosk/credits"
          element={
            <ProtectedRoute role="kiosk">
              <ComingSoon title="Créditos Printia" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kiosk/scan"
          element={
            <ProtectedRoute role="kiosk">
              <KioskQRScan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kiosk/print"
          element={
            <ProtectedRoute role="kiosk">
              <KioskPrint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kiosk/files"
          element={
            <ProtectedRoute role="user">
              <ComingSoon title="Mis Documentos en la Nube" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
