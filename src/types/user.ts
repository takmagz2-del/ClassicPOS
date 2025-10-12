export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

export interface User {
  id: string;
  email: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  role: UserRole;
}