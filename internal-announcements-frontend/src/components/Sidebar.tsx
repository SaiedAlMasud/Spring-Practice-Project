import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const dashboard: NavItem = {
  to: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
};
const announcements: NavItem = {
  to: "/announcements",
  label: "Announcements",
  icon: Megaphone,
  end: true,
};
const changePassword: NavItem = {
  to: "/change-password",
  label: "Change Password",
  icon: KeyRound,
};

const hrSections: NavSection[] = [
  { title: "Overview", items: [dashboard, announcements] },
  {
    title: "Manage",
    items: [
      { to: "/announcements/create", label: "Create", icon: Plus },
      { to: "/employees", label: "Employees", icon: Users },
    ],
  },
  { title: "Account", items: [changePassword] },
];

const employeeSections: NavSection[] = [
  { title: "Overview", items: [dashboard, announcements] },
  { title: "Account", items: [changePassword] },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isHR = user?.role === "HR";
  const sections = isHR ? hrSections : employeeSections;
  const initial = (user?.email?.[0] ?? "U").toUpperCase();

  const close = () => setOpen(false);

  // Esc চাপলে mobile menu বন্ধ হবে
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const brand = (
    <Link
      to="/dashboard"
      onClick={close}
      className="flex items-center gap-2 text-slate-900"
    >
      <span className="rounded-lg bg-blue-600 p-1.5 text-white">
        <Bell size={18} aria-hidden="true" />
      </span>
      <span className="text-base font-bold tracking-tight">Announcements</span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="sidebar"
          aria-label="Open menu"
          className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:sticky md:top-0 md:z-30 md:h-screen md:shrink-0 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          {brand}
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map(({ to, label, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={close}
                      className={linkClass}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            aria-hidden="true"
                            className={
                              isActive ? "text-blue-600" : "text-slate-400"
                            }
                          />
                          {label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="shrink-0 border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {user?.email ?? "User"}
              </p>
              <span
                className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isHR
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user?.role ?? "Unknown"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}