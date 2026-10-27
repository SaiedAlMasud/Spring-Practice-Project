
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Plus, Search, X, KeyRound, Copy, RefreshCw } from "lucide-react";
import { resetEmployeePassword } from '../services/employeeService';
import { getDepartments } from "../services/departmentService";
import type { Department } from "../services/departmentService";
import {
  createEmployee,
  getEmployees,
  updateEmployeeStatus,
} from "../services/employeeService";
import type { Employee } from "../types/employee";

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const arr = new Uint32Array(10);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join('');
};

export default function EmployeesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingEmployeeId, setUpdatingEmployeeId] = useState<number | null>(
    null
  );
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);
const [resetPassword, setResetPassword] = useState('');
const [resetError, setResetError] = useState('');
const [resetLoading, setResetLoading] = useState(false);
const [resetDone, setResetDone] = useState(false);

const openReset = (emp: Employee) => {
  setResetTarget(emp);
  setResetPassword(generatePassword());
  setResetError('');
  setResetDone(false);
};

const closeReset = () => {
  setResetTarget(null);
  setResetPassword('');
};

const handleReset = async () => {
  if (!resetTarget) return;
  if (resetPassword.length < 8) {
    setResetError('Password must be at least 8 characters');
    return;
  }
  try {
    setResetLoading(true);
    setResetError('');
    await resetEmployeePassword(resetTarget.id, resetPassword);
    setResetDone(true);
  } catch (err: any) {
    setResetError(err.response?.data?.message || 'Could not reset password');
  } finally {
    setResetLoading(false);
  }
};

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [departmentList, employeeList] = await Promise.all([
        getDepartments(),
        getEmployees(),
      ]);

      setDepartments(departmentList);
      setEmployees(employeeList);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setLoadError("Unable to connect to the backend server.");
        } else if (err.response.status === 401) {
          setLoadError("Your session has expired. Please log in again.");
        } else if (err.response.status === 403) {
          setLoadError("Only HR can view employees.");
        } else {
          setLoadError("Failed to load employees. Please try again.");
        }
      } else {
        setLoadError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const closeForm = useCallback(() => {
    if (!submitting) {
      setShowForm(false);
    }
  }, [submitting]);

  useEffect(() => {
    if (!showForm) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm, closeForm]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setDepartmentId("");
    setShowPassword(false);
    setFormError("");
  };

  const openForm = () => {
    resetForm();
    setSuccess("");
    setShowForm(true);
  };

  const refreshEmployees = async () => {
    try {
      setEmployees(await getEmployees());
    } catch {
      setLoadError(
        "Employee was saved, but the list could not be refreshed. Please reload the page."
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!departmentId) {
      setFormError("Please select a department.");
      return;
    }

    setSubmitting(true);

    try {
      const created = await createEmployee({
        name: name.trim(),
        email: email.trim(),
        password,
        departmentId: Number(departmentId),
      });

      setShowForm(false);
      resetForm();
      setSuccess(
        `Employee "${created.name}" was added. They can now log in with ${created.email}.`
      );

      await refreshEmployees();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (!err.response) {
          setFormError("Unable to connect to the backend server.");
        } else if (status === 409) {
          setFormError(
            err.response.data?.message ??
              "An employee with the same name or email already exists."
          );
        } else if (status === 403) {
          setFormError("Only HR can add employees.");
        } else if (status === 401) {
          setFormError("Your session has expired. Please log in again.");
        } else {
          setFormError(
            err.response.data?.message ?? "Failed to add employee."
          );
        }
      } else {
        setFormError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const action = emp.active ? "deactivate" : "reactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${emp.name}?`
      )
    ) {
      return;
    }

    setUpdatingEmployeeId(emp.id);
    setLoadError("");
    setSuccess("");

    try {
      await updateEmployeeStatus(emp.id, !emp.active);
      await loadData();
      setSuccess(
        `${emp.name} has been ${emp.active ? "deactivated" : "reactivated"}.`
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (!err.response) {
          setLoadError("Unable to connect to the backend server.");
        } else if (status === 401) {
          setLoadError("Your session has expired. Please log in again.");
        } else if (status === 403) {
          setLoadError("You are not allowed to change this account status.");
        } else {
          setLoadError(
            err.response.data?.message ?? "Could not update status."
          );
        }
      } else {
        setLoadError("Could not update status.");
      }
    } finally {
      setUpdatingEmployeeId(null);
    }
  };

  // HR বাদ দিয়ে শুধু EMPLOYEE role
  const employeeOnly = useMemo(
    () => employees.filter((employee) => employee.role === "EMPLOYEE"),
    [employees]
  );

  const visibleEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return employeeOnly;
    }

    return employeeOnly.filter(
      (employee) =>
        employee.name.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        employee.departmentName.toLowerCase().includes(term)
    );
  }, [employeeOnly, search]);

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              HR Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Employees
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View employees, manage account status, and add new employees.
            </p>
          </div>

          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} aria-hidden="true" />
            Add Employee
          </button>
        </header>

        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {loadError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => void loadData()}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-900">
              All employees ({employeeOnly.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or department"
                aria-label="Search employees"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              Loading employees...
            </p>
          ) : visibleEmployees.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-2xl">👥</div>
              <p className="mt-3 text-sm font-medium text-slate-900">
                {employeeOnly.length === 0
                  ? "No employees yet"
                  : "No employees match your search"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {employeeOnly.length === 0
                  ? 'Click "Add Employee" to add the first one.'
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="px-5 py-3 font-medium text-slate-900 sm:px-6">
                        {emp.name}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {emp.email}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {emp.departmentName}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            emp.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {emp.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="flex gap-4 px-4 py-3">
                        
                          <button
                            type="button"
                            onClick={() => void handleToggleStatus(emp)}
                            disabled={updatingEmployeeId === emp.id}
                            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              emp.active
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {updatingEmployeeId === emp.id
                              ? "Updating..."
                              : emp.active
                                ? "Deactivate"
                                : "Reactivate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openReset(emp)}
                            className="mr-3 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <KeyRound className="h-4 w-4" />
                            Reset Password
                          </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeForm}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-employee-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="add-employee-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Add Employee
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  The employee can log in with this email and password.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="employee-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="employee-name"
                  type="text"
                  required
                  autoFocus
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Each employee must have a unique name.
                </p>
              </div>

              <div>
                <label
                  htmlFor="employee-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="employee-email"
                  type="email"
                  required
                  maxLength={150}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="employee-password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password (8 to 72 characters)
                </label>

                <div className="flex gap-2">
                  <input
                    id="employee-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="employee-department"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Department
                </label>

                <select
                  id="employee-department"
                  required
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">Select a department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="reset-password-title"
              className="text-lg font-semibold text-gray-900"
            >
              Reset password for {resetTarget.name}
            </h2>

            {resetError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {resetError}
              </p>
            )}

            {!resetDone ? (
              <>
                <p className="text-sm text-gray-500">
                  Set a temporary password. The employee must change it on
                  next login.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resetPassword}
                    onChange={(event) =>
                      setResetPassword(event.target.value)
                    }
                    autoComplete="off"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label="Temporary password"
                  />

                  <button
                    type="button"
                    onClick={() => setResetPassword(generatePassword())}
                    className="rounded-lg border border-gray-300 px-3 text-gray-600 hover:bg-gray-50"
                    title="Generate password"
                    aria-label="Generate password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeReset}
                    disabled={resetLoading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleReset()}
                    disabled={resetLoading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {resetLoading ? "Saving..." : "Reset password"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  Password reset successfully. Share this temporary password
                  with the employee now. You won't be able to see it again
                  after closing this window.
                </p>

                <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-100 px-3 py-2">
                  <span className="break-all font-mono text-sm">
                    {resetPassword}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(resetPassword)
                        .catch(() => {
                          setResetError(
                            "Could not copy the password. Please copy it manually."
                          );
                        });
                    }}
                    className="shrink-0 text-gray-600 hover:text-gray-900"
                    title="Copy password"
                    aria-label="Copy password"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                {resetError && (
                  <p role="alert" className="text-sm text-red-700">
                    {resetError}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeReset}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </main>
  );
}


