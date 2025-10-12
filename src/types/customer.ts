export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string; // Made optional
  address?: string; // Made optional
  loyaltyPoints: number; // New: Loyalty points for the customer
}