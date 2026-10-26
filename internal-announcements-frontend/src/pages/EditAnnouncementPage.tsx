
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import api from "../services/api";
import { getAnnouncement } from "../services/announcementService";
import {
  getDepartments,
  type Department,
} from "../services/departmentService";
import type { AnnouncementType } from "../types/announcement";
import { ArrowLeft } from "lucide-react";

interface AnnouncementForm {
  title: string;
  body: string;
  type: AnnouncementType;
  targetDepartmentId: string;
  expiresAt: string;
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 16);
}

export default function EditAnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<AnnouncementForm>({
    title: "",
    body: "",
    type: "GENERAL",
    targetDepartmentId: "",
    expiresAt: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDepartments() {
      try {
        const data = await getDepartments();

        if (!cancelled) {
          setDepartments(data);
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          if (!err.response) {
            setDepartmentError(
              "Unable to connect to the server. Check that the backend is running."
            );
          } else {
            setDepartmentError(
              err.response.data?.message ??
                "Failed to load departments."
            );
          }
        } else {
          setDepartmentError("Failed to load departments.");
        }
      } finally {
        if (!cancelled) {
          setDepartmentLoading(false);
        }
      }
    }

    void loadDepartments();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setError("Invalid announcement ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadAnnouncement() {
      try {
        const announcement = await getAnnouncement(Number(id));

        if (cancelled) return;

        if (announcement.archived) {
          setError("Archived announcements cannot be edited.");
          return;
        }

        setForm({
          title: announcement.title,
          body: announcement.body,
          type: announcement.type,
          targetDepartmentId:
            announcement.targetDepartmentId == null
              ? ""
              : String(announcement.targetDepartmentId),
          expiresAt: toDateTimeLocal(announcement.expiresAt),
        });
      } catch (err: unknown) {
        if (cancelled) return;

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError("Announcement not found.");
          } else if (err.response?.status === 403) {
            setError("Only HR can edit announcements.");
          } else if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else {
            setError("Failed to load announcement.");
          }
        } else {
          setError("An unexpected error occurred.");
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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!id || !/^\d+$/.test(id)) {
      setError("Invalid announcement ID.");
      return;
    }

    if (departmentLoading || departmentError) {
      setError("Please wait until departments load successfully.");
      return;
    }

    const expiryDate = new Date(form.expiresAt);

    if (
      !form.expiresAt ||
      Number.isNaN(expiryDate.getTime()) ||
      expiryDate <= new Date()
    ) {
      setError("Expiry date and time must be in the future.");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/announcements/${id}`, {
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
        targetDepartmentId: form.targetDepartmentId
          ? Number(form.targetDepartmentId)
          : null,
        expiresAt: expiryDate.toISOString(),
      });

      navigate("/announcements");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Unable to connect to the server.");
        } else if (err.response.status === 400) {
          setError("Invalid input. Check all fields and expiry date.");
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response.status === 403) {
          setError("Only HR can edit announcements.");
        } else if (err.response.status === 404) {
          setError("Announcement or target department not found.");
        } else if (err.response.status === 409) {
          setError("This announcement cannot be edited.");
        } else {
          setError(
            err.response.data?.message ??
              "Failed to update announcement."
          );
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8 text-center text-slate-600">
        Loading announcement...
      </main>
    );
  }

  const cannotEdit =
    error.includes("Archived announcements") ||
    error.includes("Invalid announcement ID.") ||
    error === "Announcement not found." ||
    error === "Only HR can edit announcements." ||
    error === "Your session has expired. Please log in again.";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        
        <button
        type="button"
        onClick={() => navigate("/announcements")}
        aria-label="Back to announcements"
        title="Back to announcements"
        className="mb-5 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100"
        >
        <ArrowLeft size={20} aria-hidden="true" /> Back to Announcements
        </button>


        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Announcement
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Update the announcement details below.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {!cannotEdit && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Title
                </label>

                <input
                  id="title"
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="body"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Announcement Body
                </label>

                <textarea
                  id="body"
                  required
                  rows={6}
                  value={form.body}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      body: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Announcement Type
                </label>

                <select
                  id="type"
                  value={form.type}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      type: event.target.value as AnnouncementType,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="GENERAL">General</option>
                  <option value="POLICY">Policy</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Target Department
                </label>

                <select
                  id="department"
                  value={form.targetDepartmentId}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      targetDepartmentId: event.target.value,
                    }))
                  }
                  disabled={departmentLoading || !!departmentError}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    {departmentLoading
                      ? "Loading departments..."
                      : departmentError
                        ? "Departments unavailable"
                        : "All Departments"}
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>

                {departmentLoading && (
                  <p className="mt-2 text-xs text-slate-500">
                    Loading departments...
                  </p>
                )}

                {departmentError && (
                  <div
                    role="alert"
                    className="mt-2 text-sm text-red-600"
                  >
                    <p>{departmentError}</p>

                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-1 font-semibold underline"
                    >
                      Reload page
                    </button>
                  </div>
                )}

                {!departmentLoading && !departmentError && (
                  <p className="mt-2 text-xs text-slate-500">
                    Choose All Departments or a specific department.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="expiresAt"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Expiry Date and Time
                </label>

                <input
                  id="expiresAt"
                  type="datetime-local"
                  required
                  value={form.expiresAt}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      expiresAt: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/announcements")}
                  className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    departmentLoading ||
                    !!departmentError
                  }
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
