export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number;
  departmentName: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  password: string;
  departmentId: number;
}