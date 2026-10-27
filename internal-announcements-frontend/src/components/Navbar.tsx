
import { useState } from "react";
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

const hrLinks: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/announcements", label: "Announcements", icon: Megaphone, end: true },
  { to: "/announcements/create", label: "Create", icon: Plus },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/change-password", label: "Change Password", icon: KeyRound },
];

const employeeLinks: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/announcements", label: "Announcements", icon: Megaphone, end: true },
  { to: "/change-password", label: "Change Password", icon: KeyRound },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHR = user?.role === "HR";
  const links = isHR ? hrLinks : employeeLinks;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-slate-900"
          >
            <span className="rounded-lg bg-blue-600 p-1.5 text-white">
              <Bell size={18} aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-tight">
              Announcements
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={linkClass}>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right leading-tight">
            <p className="max-w-[180px] truncate text-sm font-medium text-slate-800">
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

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {menuOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 md:hidden"
        >
          <ul className="space-y-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={closeMenu}
                  className={linkClass}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {user?.email ?? "User"}
              </p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isHR
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user?.role ?? "Unknown"}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
