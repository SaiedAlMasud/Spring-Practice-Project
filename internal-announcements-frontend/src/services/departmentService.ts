
import api from "./api";

export interface Department {
  id: number;
  name: string;
}

export async function getDepartments(): Promise<Department[]> {
  const response = await api.get<Department[]>("/departments");
  return response.data;
}
