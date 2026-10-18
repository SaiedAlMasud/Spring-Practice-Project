
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { getAcknowledgementTracking } from "../services/announcementService";
import type { AcknowledgementTracking } from "../services/announcementService";

export default function AcknowledgementTrackingPage() {
  const { id } = useParams<{ id: string }>();

  const [tracking, setTracking] =
    useState<AcknowledgementTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setError("Invalid announcement ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadTracking = async () => {
      try {
        const result = await getAcknowledgementTracking(Number(id));

        if (!cancelled) {
          setTracking(result);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else if (err.response?.status === 403) {
            setError("Only HR can view acknowledgement tracking.");
          } else if (err.response?.status === 404) {
            setError("Announcement not found.");
          } else if (err.response?.status === 400) {
            setError("Tracking is available only for policy announcements.");
          } else {
            setError("Failed to load acknowledgement tracking.");
          }
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTracking();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-center text-slate-600">
        Loading acknowledgement tracking...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/announcements"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          &larr; Back to announcements
        </Link>

        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            HR Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Policy Acknowledgement Tracking
          </h1>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {tracking && (
          <>
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Policy announcement</p>

              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {tracking.title}
              </h2>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-700">
                    Completion
                  </span>

                  <span className="text-lg font-bold text-blue-700">
                    {tracking.completionPercentage.toFixed(2)}%
                  </span>
                </div>

                <div
                  className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Acknowledgement completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(
                    100,
                    Math.max(0, tracking.completionPercentage)
                  )}
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, tracking.completionPercentage)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Employees</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {tracking.totalEmployees}
                </p>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-sm text-green-700">Acknowledged</p>
                <p className="mt-2 text-3xl font-bold text-green-800">
                  {tracking.acknowledgedCount}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm text-amber-700">Pending</p>
                <p className="mt-2 text-3xl font-bold text-amber-800">
                  {tracking.pendingCount}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
