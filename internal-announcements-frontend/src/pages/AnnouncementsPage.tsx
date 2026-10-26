import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  getAnnouncements,
  getManagedAnnouncements,
} from "../services/announcementService";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import type {
  Announcement,
  AnnouncementType,
} from "../types/announcement";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isHR = user?.role === "HR";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | AnnouncementType>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // HR সব announcement দেখবে, employee শুধু নিজের feed
      const fetchAnnouncements = isHR
        ? getManagedAnnouncements
        : getAnnouncements;

      const result = await fetchAnnouncements({
        search: search.trim() || undefined,
        type: type || undefined,
        page,
        size: 10,
      });

      setAnnouncements(result.content);
      setTotalPages(result.totalPages);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        console.error("Announcement API failed:", {
          status,
          data: error.response?.data,
          message: error.message,
        });

        if (!error.response) {
          setError(
            "Backend connection failed. Check that the backend is running."
          );
        } else if (status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (status === 403) {
          setError("Access denied. Check your permissions.");
        } else if (status === 404) {
          setError("Announcement API was not found.");
        } else {
          setError(`Failed to load announcements. HTTP status: ${status}`);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [search, type, page, reloadKey, isHR]);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const handleArchive = async (announcement: Announcement) => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${announcement.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoadingId(announcement.id);

    try {
      await api.patch(`/announcements/${announcement.id}/archive`);

      setActionSuccess("Announcement archived successfully.");
      setReloadKey((current) => current + 1);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          setActionError("Your session has expired. Please log in again.");
        } else if (status === 403) {
          setActionError("Only HR can archive announcements.");
        } else if (status === 404) {
          setActionError("Announcement not found.");
        } else if (status === 409) {
          setActionError("This announcement is already archived.");
        } else {
          setActionError(
            error.response?.data?.message ??
              "Failed to archive announcement."
          );
        }
      } else {
        setActionError("An unexpected error occurred while archiving.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleTypeChange = (value: string) => {
    setType(value as "" | AnnouncementType);
    setPage(0);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleDateString();
  };

  const isExpired = (value: string) => {
    const date = new Date(value);

    return !Number.isNaN(date.getTime()) && date < new Date();
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            {isHR ? "HR Portal" : "Employee Portal"}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Announcements
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Company updates and policies in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {isHR && (
                <Link
                  to="/announcements/create"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  + Create Announcement
                </Link>
              )}

              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_200px]">
          <div>
            <label
              htmlFor="announcement-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search announcements
            </label>

            <input
              id="announcement-search"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by title or content..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="announcement-type"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Announcement type
            </label>

            <select
              id="announcement-type"
              value={type}
              onChange={(event) => handleTypeChange(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All types</option>
              <option value="GENERAL">General</option>
              <option value="POLICY">Policy</option>
            </select>
          </div>
        </section>

        {actionError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {actionSuccess}
          </div>
        )}

        {!loading && !error && (
          <p className="mb-4 text-sm text-slate-500">
            Showing {announcements.length} announcement
            {announcements.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">
              Loading announcements...
            </p>
          </div>
        )}

        {!loading && error && (
          <section
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-semibold text-red-800">
              Unable to load announcements
            </h2>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </section>
        )}

        {!loading && !error && announcements.length === 0 && (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="text-2xl">📢</div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No announcements found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try another search term or select a different type.
            </p>

            {(search || type) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setType("");
                  setPage(0);
                }}
                className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </section>
        )}

        {!loading && !error && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      announcement.type === "POLICY"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {announcement.type}
                  </span>

                  {announcement.targetDepartmentName ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {announcement.targetDepartmentName}
                    </span>
                  ) : (
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                      All Departments
                    </span>
                  )}

                  {isHR && announcement.archived && (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      Archived
                    </span>
                  )}

                  {isHR &&
                    !announcement.archived &&
                    isExpired(announcement.expiresAt) && (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        Expired
                      </span>
                    )}

                  {announcement.type === "POLICY" && !isHR && (
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

                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  {announcement.title}
                </h2>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                  {announcement.body}
                </p>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>
                    Published: {formatDate(announcement.createdAt)}
                  </span>

                  <span>
                    Expires: {formatDate(announcement.expiresAt)}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={`/announcements/${announcement.id}`}
                    className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    View Details
                  </Link>

                  {isHR && announcement.type === "POLICY" && (
                    <Link
                      to={`/announcements/${announcement.id}/acknowledgement-tracking`}
                      className="inline-flex rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-800 hover:bg-purple-100"
                    >
                      Track Acknowledgements
                    </Link>
                  )}

                  {isHR && !announcement.archived && (
                    <>
                      <Link
                        to={`/announcements/${announcement.id}/edit`}
                        className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleArchive(announcement)}
                        disabled={actionLoadingId === announcement.id}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoadingId === announcement.id
                          ? "Archiving..."
                          : "Archive"}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <nav
            aria-label="Announcement pagination"
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-slate-600">
              Page {page + 1} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}