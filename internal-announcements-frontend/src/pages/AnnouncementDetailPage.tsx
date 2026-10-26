
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

import { useAuth } from "../context/AuthContext";
import {
  acknowledgePolicy,
  getAnnouncement,
} from "../services/announcementService";
import type { Announcement } from "../types/announcement";

export default function AnnouncementDetailPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === "EMPLOYEE";

  const { id } = useParams<{ id: string }>();

  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncement() {
      if (!id || !/^\d+$/.test(id)) {
        setError("Invalid announcement ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getAnnouncement(Number(id));

        if (!cancelled) {
          setAnnouncement(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          if (axios.isAxiosError(err)) {
            if (!err.response) {
              setError("Unable to connect to the server.");
            } else if (err.response.status === 404) {
              setError("Announcement not found.");
            } else if (err.response.status === 403) {
              setError(
                "You do not have permission to view this announcement."
              );
            } else if (err.response.status === 401) {
              setError("Your session has expired. Please log in again.");
            } else {
              setError(
                "Unable to load announcement. Please try again."
              );
            }
          } else {
            setError("An unexpected error occurred.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAnnouncement();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAcknowledge = async () => {
    if (
      !isEmployee ||
      !announcement ||
      announcement.type !== "POLICY" ||
      announcement.acknowledged ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await acknowledgePolicy(announcement.id);

      setAnnouncement((previous) =>
        previous
          ? { ...previous, acknowledged: true }
          : previous
      );

      setSuccess("Policy acknowledged successfully.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Unable to connect to the server.");
        } else if (err.response.status === 409) {
          setError("This policy has already been acknowledged.");
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response.status === 403) {
          setError("You are not allowed to acknowledge this policy.");
        } else if (err.response.status === 404) {
          setError("Announcement not found.");
        } else {
          setError(
            "Unable to acknowledge policy. Please try again."
          );
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <p className="text-slate-500">
          Loading announcement...
        </p>
      </main>
    );
  }

  if (error && !announcement) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6">
          <p role="alert" className="text-red-700">
            {error}
          </p>

          <Link
            to="/announcements"
            aria-label="Back to announcements"
            title="Back to announcements"
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
        </div>
      </main>
    );
  }

  if (!announcement) {
    return null;
  }

  const formatDate = (value: string) => {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleDateString();
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          to="/announcements"
          aria-label="Back to announcements"
          title="Back to announcements"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              announcement.type === "POLICY"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {announcement.type}
          </span>

          {announcement.type === "POLICY" && isEmployee && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                announcement.acknowledged
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {announcement.acknowledged
                ? "Acknowledged"
                : "Pending acknowledgement"}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          {announcement.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
          <span>
            Published: {formatDate(announcement.createdAt)}
          </span>

          <span>
            Expires: {formatDate(announcement.expiresAt)}
          </span>
        </div>

        <div className="my-6 border-t border-slate-200" />

        <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
          {announcement.body}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-6 rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {success}
          </p>
        )}

        {announcement.type === "POLICY" && isEmployee && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            {announcement.acknowledged ? (
              <p className="font-medium text-green-700">
                You have acknowledged this policy.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-600">
                  Please read this policy carefully before acknowledging it.
                </p>

                <button
                  type="button"
                  onClick={() => void handleAcknowledge()}
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : "Acknowledge Policy"}
                </button>
              </>
            )}
          </div>
        )}
      </article>
    </main>
  );
}
