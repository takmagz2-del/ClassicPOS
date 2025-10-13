import { Supplier } from "@/types/supplier";

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Tech Innovations Inc.",
    contactPerson: "Jane Doe",
    email: "jane.doe@techinnovations.com",
    phone: "111-222-3333",
    address: "456 Tech Drive, Silicon Valley, CA",
    notes: "Primary supplier for electronics and gadgets.",
    vatNumber: "VAT123456789",
    tinNumber: "TIN987654321",
  },
  {
    id: "sup-2",
    name: "Office Essentials Co.",
    contactPerson: "John Smith",
    email: "john.smith@officeessentials.com",
    phone: "444-555-6666",
    address: "789 Business Rd, Office City, NY",
    notes: "Supplier for office furniture and supplies.",
    vatNumber: "VAT987654321",
  },
  {
    id: "sup-3",
    name: "Global Logistics Ltd.",
    contactPerson: "Alice Brown",
    email: "alice.brown@globallogistics.com",
    phone: "777-888-9999",
    address: "101 Warehouse St, Port Town, FL",
    notes: "Shipping and warehousing partner.",
  },
];