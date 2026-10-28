import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getEmployeeDashboard,
  getHrDashboard,
} from "../services/dashboardService";
import type {
  EmployeeDashboard,
  HrDashboard,
} from "../types/dashboard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import EmployeeDashboardView from "../components/dashboard/EmployeeDashboardView";
import ErrorAlert from "../components/dashboard/ErrorAlert";
import HrDashboardView from "../components/dashboard/HrDashboardView";
import { getErrorMessage } from "../components/dashboard/helpers";

export default function DashboardPage() {
  const { user } = useAuth();
  const isHR = user?.role === "HR";

  const [hrData, setHrData] = useState<HrDashboard | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (isHR) {
        setHrData(await getHrDashboard());
      } else {
        setEmployeeData(await getEmployeeDashboard());
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isHR]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const hasData = isHR ? hrData !== null : employeeData !== null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6 md:min-h-screen lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          email={user?.email}
          isHR={isHR}
          loading={loading}
          onRefresh={() => void loadDashboard()}
        />

        {error && (
          <ErrorAlert
            message={error}
            onRetry={() => void loadDashboard()}
          />
        )}

        {loading && !hasData ? (
          <DashboardSkeleton cards={isHR ? 6 : 4} />
        ) : isHR && hrData ? (
          <HrDashboardView data={hrData} />
        ) : !isHR && employeeData ? (
          <EmployeeDashboardView data={employeeData} />
        ) : null}

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Internal Announcements and Policy Acknowledgement System
        </footer>
      </div>
    </main>
  );
}
