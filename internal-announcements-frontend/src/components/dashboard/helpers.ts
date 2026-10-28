import axios from "axios";

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function displayName(email?: string): string {
  if (!email) return "there";

  const name = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return name || "there";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function shortDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function shortMonth(yearMonth: string): string {
  return new Date(`${yearMonth}-01T00:00:00`).toLocaleDateString("en-GB", {
    month: "short",
  });
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Unable to connect to the backend server.";
    if (err.response.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (err.response.status === 403) {
      return "You do not have permission to view dashboard statistics.";
    }
    return err.response.data?.message ?? "Failed to load dashboard statistics.";
  }

  return "An unexpected error occurred.";
}
