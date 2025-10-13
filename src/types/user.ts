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
  businessName?: string; // New field
  businessType?: string; // New field
  country?: string; // New field
  phone?: string; // New field
}