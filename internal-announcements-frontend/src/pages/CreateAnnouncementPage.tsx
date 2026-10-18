
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import api from "../services/api";
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

export default function CreateAnnouncementPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<AnnouncementForm>({
    title: "",
    body: "",
    type: "GENERAL",
    targetDepartmentId: "",
    expiresAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState("");

  useEffect(() => {
    async function loadDepartments() {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (!error.response) {
            setDepartmentError(
              "Unable to connect to the server. Check that the backend is running."
            );
          } else {
            setDepartmentError(
              error.response.data?.message ??
                "Failed to load departments."
            );
          }
        } else {
          setDepartmentError("Failed to load departments.");
        }
      } finally {
        setDepartmentLoading(false);
      }
    }

    void loadDepartments();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (departmentLoading || departmentError) {
      setError("Please wait until departments are loaded successfully.");
      return;
    }

    if (!form.expiresAt) {
      setError("Please select an expiry date and time.");
      return;
    }

    const expiryDate = new Date(form.expiresAt);

    if (
      Number.isNaN(expiryDate.getTime()) ||
      expiryDate <= new Date()
    ) {
      setError("Expiry date and time must be in the future.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/announcements", {
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
        targetDepartmentId: form.targetDepartmentId
          ? Number(form.targetDepartmentId)
          : null,
        expiresAt: expiryDate.toISOString(),
      });

      setSuccess("Announcement created successfully!");

      window.setTimeout(() => {
        navigate("/announcements");
      }, 1000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (!err.response) {
          setError("Unable to connect to the server.");
        } else if (status === 400) {
          setError(
            err.response.data?.message ??
              "Invalid input. Please check your form."
          );
        } else if (status === 401) {
          setError("Session expired. Please log in again.");
        } else if (status === 403) {
          setError("Only HR users can create announcements.");
        } else if (status === 404) {
          setError("The selected department or resource was not found.");
        } else {
          setError(
            err.response.data?.message ??
              "Failed to create announcement. Please try again."
          );
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        
        <button
        type="button"
        onClick={() => navigate("/announcements")}
        aria-label="Back to announcements"
        title="Back to announcements"
        className="mb-5 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100"
        >
        <ArrowLeft size={20} aria-hidden="true" />
        </button>


        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Announcement
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Publish a general announcement or a policy for employees.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={200}
                value={form.title}
                onChange={handleChange}
                placeholder="Enter announcement title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="body"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Announcement Body
              </label>

              <textarea
                id="body"
                name="body"
                required
                rows={6}
                value={form.body}
                onChange={handleChange}
                placeholder="Write the announcement details..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Announcement Type
              </label>

              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="GENERAL">General Announcement</option>
                <option value="POLICY">
                  Policy (Acknowledgement Required)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="targetDepartmentId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Target Department
              </label>

              <select
                id="targetDepartmentId"
                name="targetDepartmentId"
                value={form.targetDepartmentId}
                onChange={handleChange}
                disabled={departmentLoading || !!departmentError}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                <p className="mt-2 text-xs text-gray-500">
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
                <p className="mt-2 text-xs text-gray-500">
                  Choose All Departments or a specific department.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="expiresAt"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Expiry Date and Time
              </label>

              <input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                required
                value={form.expiresAt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/announcements")}
                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  departmentLoading ||
                  !!departmentError
                }
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Publishing..." : "Publish Announcement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
