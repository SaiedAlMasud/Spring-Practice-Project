
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface DashboardSummary {
  totalEmployees: number;
  totalAnnouncements: number;
  activeAnnouncements: number;
  archivedAnnouncements: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const isHR = user?.role === "HR";

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!isHR) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get<DashboardSummary>("/dashboard");
      setSummary(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Unable to connect to the backend server.");
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response.status === 403) {
          setError("You do not have permission to view dashboard statistics.");
        } else {
          setError(
            err.response.data?.message ??
              "Failed to load dashboard statistics."
          );
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [isHR]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    {
      label: "Total Employees",
      value: summary?.totalEmployees,
      description: "Registered employees",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total Announcements",
      value: summary?.totalAnnouncements,
      description: "All announcements",
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Active Announcements",
      value: summary?.activeAnnouncements,
      description: "Currently active and unexpired",
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Archived Announcements",
      value: summary?.archivedAnnouncements,
      description: "Archived announcements",
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              {isHR ? "HR Portal" : "Employee Portal"}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome, {user?.email ?? "User"}
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                isHR
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {user?.role ?? "Unknown Role"}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {isHR ? (
          <>
            <section className="mb-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Summary of employees and announcements.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadDashboard()}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  {loading ? "Refreshing..." : "Refresh Statistics"}
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    className="mt-2 font-semibold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {loading && summary === null
                        ? "..."
                        : (card.value ?? "—")}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      {card.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                HR Management
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  to="/announcements"
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-100 p-3 text-2xl">
                      📢
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
                        Manage Announcements
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        View, edit and archive announcements.
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/announcements/create"
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-green-100 p-3 text-2xl">
                      ✍️
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
                        Create Announcement
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Publish a company update or policy.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </>
        ) : (
          <section>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Stay informed
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                View company announcements, read important policies and
                acknowledge policies that require your confirmation.
              </p>

              <Link
                to="/announcements"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View Announcements
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-2xl">📢</div>
                <h3 className="mt-3 font-semibold text-slate-900">
                  Company Updates
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Read announcements relevant to you and your department.
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-2xl">✓</div>
                <h3 className="mt-3 font-semibold text-slate-900">
                  Policy Acknowledgement
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review policies and acknowledge them when required.
                </p>
              </article>
            </div>
          </section>
        )}

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          Internal Announcements and Policy Acknowledgement System
        </footer>
      </div>
    </main>
  );
}
