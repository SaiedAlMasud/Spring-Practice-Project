
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
  mustChangePassword: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (
    token: string,
    email: string,
    role: UserRole,
    mustChangePassword: boolean
  ) => void;
  updatePasswordChanged: () => void;
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
    const mustChangePassword =
      localStorage.getItem("mustChangePassword");

    if (
      email &&
      (role === "HR" || role === "EMPLOYEE") &&
      localStorage.getItem("token")
    ) {
      return {
        email,
        role,
        mustChangePassword: mustChangePassword === "true",
      };
    }

    return null;
  });

  const login = (
    newToken: string,
    email: string,
    role: UserRole,
    mustChangePassword: boolean
  ) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);
    localStorage.setItem(
      "mustChangePassword",
      String(mustChangePassword)
    );

    setToken(newToken);
    setUser({ email, role, mustChangePassword });
  };

  const updatePasswordChanged = () => {
    localStorage.setItem("mustChangePassword", "false");

    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, mustChangePassword: false }
        : null
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("mustChangePassword");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        updatePasswordChanged,
        logout,
      }}
    >
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
