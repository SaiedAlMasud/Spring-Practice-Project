
import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { UserRole } from "../types/auth";

interface AuthUser {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );

  const [user, setUser] = useState<AuthUser | null>(() => {
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (
      email &&
      (role === "HR" || role === "EMPLOYEE") &&
      localStorage.getItem("token")
    ) {
      return { email, role };
    }

    return null;
  });

  const login = (newToken: string, email: string, role: UserRole) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);

    setToken(newToken);
    setUser({ email, role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
