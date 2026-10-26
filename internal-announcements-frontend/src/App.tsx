import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AcknowledgementTrackingPage from "./pages/AcknowledgementTrackingPage";
import EditAnnouncementPage from "./pages/EditAnnouncementPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AnnouncementDetailPage from "./pages/AnnouncementDetailPage";
import CreateAnnouncementPage from "./pages/CreateAnnouncementPage";
import EmployeesPage from "./pages/EmployeesPage";

function HomeRedirect() {
  const { user, token } = useAuth();

  if (user && token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Navbar ছাড়া পাতা */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Navbar সহ সব পাতা (লগইন করা থাকতে হবে) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/announcements" element={<AnnouncementsPage />} />

            <Route
              path="/announcements/:id"
              element={<AnnouncementDetailPage />}
            />

            <Route
              path="/announcements/create"
              element={
                <ProtectedRoute allowedRoles={["HR"]}>
                  <CreateAnnouncementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/announcements/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["HR"]}>
                  <EditAnnouncementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/announcements/:id/acknowledgement-tracking"
              element={
                <ProtectedRoute allowedRoles={["HR"]}>
                  <AcknowledgementTrackingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={["HR"]}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}