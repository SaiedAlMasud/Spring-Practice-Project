import api from "./api";
import type { Department } from "./announcementService";
import type { CreateEmployeeRequest, Employee } from "../types/employee";

export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get<Department[]>("/departments");

  return response.data;
};

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get<Employee[]>("/employees");

  return response.data;
};

export const createEmployee = async (
  request: CreateEmployeeRequest
): Promise<Employee> => {
  const response = await api.post<Employee>("/employees", request);

  return response.data;
};

export const updateEmployeeStatus = async (id: number, active: boolean) => {
  await api.patch(`/employees/${id}/status`, null, { params: { active } });
};

export const resetEmployeePassword = async (id: number, newPassword: string) => {
  await api.patch(`/employees/${id}/password`, { newPassword });
};