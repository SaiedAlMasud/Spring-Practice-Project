import api from "./api";
import type { EmployeeDashboard, HrDashboard } from "../types/dashboard";

export const getHrDashboard = async (): Promise<HrDashboard> => {
  const response = await api.get<HrDashboard>("/dashboard");
  return response.data;
};

export const getEmployeeDashboard = async (): Promise<EmployeeDashboard> => {
  const response = await api.get<EmployeeDashboard>("/dashboard/employee");
  return response.data;
};