
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import AcknowledgementTrackingPage from "./pages/AcknowledgementTrackingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EditAnnouncementPage from "./pages/EditAnnouncementPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AnnouncementDetailPage from "./pages/AnnouncementDetailPage";
import CreateAnnouncementPage from "./pages/CreateAnnouncementPage";


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
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <AnnouncementsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcements/:id"
            element={
              <ProtectedRoute>
                <AnnouncementDetailPage />
              </ProtectedRoute>
            }
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
