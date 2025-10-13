import { Customer } from "@/types/customer";

export const mockCustomers: Customer[] = [
  { id: "cust-a1b2c3d4-e5f6", name: "Alice Smith", email: "alice@example.com", phone: "555-111-2222", address: "123 Oak Ave", loyaltyPoints: 150, vatNumber: "VAT001", tinNumber: "TIN001" },
  { id: "cust-b2c3d4e5-f6a7", name: "Bob Johnson", email: "bob@example.com", phone: "555-333-4444", address: "456 Pine St", loyaltyPoints: 300, tinNumber: "TIN002" },
  { id: "cust-c3d4e5f6-a7b8", name: "Charlie Brown", email: "charlie@example.com", phone: "555-555-6666", address: "789 Elm Rd", loyaltyPoints: 50 },
];